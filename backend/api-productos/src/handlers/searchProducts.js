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
        const tenantId = event.headers['X-Tenant-Id'] || event.headers['x-tenant-id'];
        
        let requestBody = {};
        if (event.body) {
            requestBody = JSON.parse(event.body);
        }
        
        const query = requestBody.query || '';
        const filters = requestBody.filters || {};
        const sort = requestBody.sort || 'relevance';
        const page = requestBody.page || 1;
        const limit = requestBody.limit || 20;
        
        if (!tenantId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ success: false, error: 'tenant_id requerido' })
            };
        }

        const indexName = `products-${tenantId}`;
        const searchQuery = buildSearchQuery(query, filters, sort, page, limit);
        
        console.log('Searching ES with query:', JSON.stringify(searchQuery, null, 2));
        
        const results = await searchES(indexName, searchQuery, sort, page, limit);
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: {
                    productos: results.hits.hits.map(hit => hit._source),
                    total: results.hits.total.value,
                    took: results.took,
                    page,
                    limit
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

const buildSearchQuery = (query, filters = {}, sort = 'relevance', page = 1, limit = 20) => {
    const must = [];
    const filter = [];
    
    // Filtro por activo
    filter.push({ term: { activo: true } });
    
    // Búsqueda de texto
    if (query && query.trim()) {
        must.push({
            multi_match: {
                query: query,
                fields: ['nombre^3', 'descripcion^2', 'tags'],
                fuzziness: 'AUTO',
                type: 'best_fields'
            }
        });
    }
    
    // Filtro por categoría
    if (filters.categoria) {
        filter.push({ term: { categoria: filters.categoria } });
    }
    
    // Filtro por precio
    if (filters.precio_min || filters.precio_max) {
        const priceRange = {};
        if (filters.precio_min) priceRange.gte = parseFloat(filters.precio_min);
        if (filters.precio_max) priceRange.lte = parseFloat(filters.precio_max);
        filter.push({ range: { precio: priceRange } });
    }
    
    // Filtro por tags
    if (filters.tags && filters.tags.length > 0) {
        filter.push({ terms: { tags: filters.tags } });
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

const searchES = async (indexName, query, sort = 'relevance', page = 1, limit = 20) => {
    const url = `${ES_URL}/${indexName}/_search`;
    
    // Calcular offset para paginación
    const from = (page - 1) * limit;
    
    // Configurar ordenamiento
    let sortConfig = [{ _score: { order: 'desc' } }];
    
    switch (sort) {
        case 'price_asc':
            sortConfig = [{ precio: { order: 'asc' } }];
            break;
        case 'price_desc':
            sortConfig = [{ precio: { order: 'desc' } }];
            break;
        case 'name_asc':
            sortConfig = [{ 'nombre.keyword': { order: 'asc' } }];
            break;
        case 'name_desc':
            sortConfig = [{ 'nombre.keyword': { order: 'desc' } }];
            break;
        case 'relevance':
        default:
            sortConfig = [
                { _score: { order: 'desc' } },
                { 'nombre.keyword': { order: 'asc' } }
            ];
            break;
    }
    
    const searchBody = { 
        query,
        size: limit,
        from: from,
        sort: sortConfig
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
