const http = require('http');

const ES_URL = process.env.ELASTICSEARCH_URL;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Tenant-Id,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,GET',
    'Content-Type': 'application/json'
};

exports.lambda_handler = async (event) => {
    console.log('Autocomplete request:', event);

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    try {
        const tenantId = event.headers['X-Tenant-Id'] || event.headers['x-tenant-id'];
        
        let requestBody = {};
        if (event.body) {
            requestBody = typeof event.body === 'string'
                ? JSON.parse(event.body)
                : event.body;
        }
        
        const query = requestBody.query || '';
        const limit = requestBody.limit || 5;
        
        if (!tenantId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ success: false, error: 'tenant_id requerido' })
            };
        }

        if (!query || query.length < 2) {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    data: { suggestions: [] }
                })
            };
        }

        const indexName = `products-${tenantId}`;
        const searchQuery = buildAutocompleteQuery(query);
        
        console.log('Autocomplete ES query:', JSON.stringify(searchQuery, null, 2));
        
        const results = await searchES(indexName, searchQuery, limit);
        
        // Extraer sugerencias únicas de nombres de productos
        const suggestions = results.hits.hits
            .map(hit => hit._source.nombre)
            .filter((nombre, index, arr) => arr.indexOf(nombre) === index) // Únicos
            .slice(0, limit); // Máximo según el límite especificado
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: {
                    suggestions,
                    total: suggestions.length
                }
            })
        };
        
    } catch (error) {
        console.error('Autocomplete error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                success: false, 
                error: 'Error en autocompletado: ' + error.message 
            })
        };
    }
};

const buildAutocompleteQuery = (query) => {
    return {
        bool: {
            must: [
                {
                    multi_match: {
                        query: query,
                        fields: ['nombre^3', 'descripcion'],
                        type: 'phrase_prefix'
                    }
                }
            ],
            filter: [
                { term: { activo: true } }
            ]
        }
    };
};

const searchES = async (indexName, query, limit = 10) => {
    const url = `${ES_URL}/${indexName}/_search`;
    const searchBody = { 
        query,
        size: limit,
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
