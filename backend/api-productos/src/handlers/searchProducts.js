const http = require('http');

const ES_URL = process.env.ELASTICSEARCH_URL;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Tenant-Id,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,GET',
    'Content-Type': 'application/json'
};

exports.lambda_handler = async (event) => {
    console.log('Search request:', event);

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    try {
        const tenantId = event.headers['X-Tenant-Id'] || event.queryStringParameters?.tenant_id;
        const query = event.queryStringParameters?.q || '';
        const fuzzy = event.queryStringParameters?.fuzzy === 'true';
        const categoria = event.queryStringParameters?.categoria;
        const minPrice = event.queryStringParameters?.min_price;
        const maxPrice = event.queryStringParameters?.max_price;
        
        if (!tenantId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ success: false, error: 'tenant_id requerido' })
            };
        }

        const indexName = `products-${tenantId}`;
        const searchQuery = buildSearchQuery(query, fuzzy, categoria, minPrice, maxPrice);
        
        console.log('Searching ES with query:', JSON.stringify(searchQuery, null, 2));
        
        const results = await searchES(indexName, searchQuery);
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: {
                    productos: results.hits.hits.map(hit => hit._source),
                    total: results.hits.total.value,
                    took: results.took
                }
            })
        };
        
    } catch (error) {
        console.error('Search error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                success: false, 
                error: 'Error en búsqueda: ' + error.message 
            })
        };
    }
};

const buildSearchQuery = (query, fuzzy, categoria, minPrice, maxPrice) => {
    const must = [];
    const filter = [];
    
    // Filtro por activo
    filter.push({ term: { activo: true } });
    
    // Búsqueda de texto
    if (query) {
        if (fuzzy) {
            must.push({
                multi_match: {
                    query: query,
                    fields: ['nombre^3', 'descripcion^2', 'tags'],
                    fuzziness: 'AUTO',
                    type: 'best_fields'
                }
            });
        } else {
            must.push({
                multi_match: {
                    query: query,
                    fields: ['nombre^3', 'descripcion^2', 'tags'],
                    type: 'best_fields'
                }
            });
        }
    }
    
    // Filtro por categoría
    if (categoria) {
        filter.push({ term: { categoria: categoria } });
    }
    
    // Filtro por precio
    if (minPrice || maxPrice) {
        const priceRange = {};
        if (minPrice) priceRange.gte = parseFloat(minPrice);
        if (maxPrice) priceRange.lte = parseFloat(maxPrice);
        filter.push({ range: { precio: priceRange } });
    }
    
    if (must.length === 0 && filter.length === 1) {
        // Solo filtro activo, devolver todo
        return { match_all: {} };
    }
    
    return {
        bool: {
            must: must.length > 0 ? must : [{ match_all: {} }],
            filter: filter
        }
    };
};

const searchES = async (indexName, query) => {
    const url = `${ES_URL}/${indexName}/_search`;
    const searchBody = { 
        query,
        size: 50,
        sort: [
            { _score: { order: 'desc' } },
            { 'nombre.keyword': { order: 'asc' } }
        ]
    };
    
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(searchBody);
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        
        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(responseData));
                } else {
                    reject(new Error(`ES error: ${res.statusCode} ${responseData}`));
                }
            });
        });
        
        req.on('error', reject);
        req.write(data);
        req.end();
    });
};
