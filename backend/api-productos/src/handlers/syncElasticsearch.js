const http = require('http');

const ES_URL = process.env.ELASTICSEARCH_URL;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Tenant-Id',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
    'Content-Type': 'application/json'
};

const syncToElasticsearch = async (record) => {
    const { eventName, dynamodb } = record;
    
    console.log('Processing record:', { eventName, keys: dynamodb.Keys });
    
    if (!dynamodb.Keys?.tenant_id?.S) {
        console.log('Skipping record without tenant_id');
        return;
    }
    
    const tenantId = dynamodb.Keys.tenant_id.S;
    const sortKey = dynamodb.Keys.SK?.S;
    
    // Solo procesar productos (SK que empiece con "PRODUCTO#")
    if (!sortKey || !sortKey.startsWith('PRODUCTO#')) {
        console.log('Skipping non-product record');
        return;
    }
    
    const productoId = sortKey.replace('PRODUCTO#', '');
    const indexName = `products-${tenantId}`;
    
    try {
        if (eventName === 'REMOVE') {
            console.log(`Deleting product ${productoId} from ES index ${indexName}`);
            await deleteFromES(indexName, productoId);
        } else {
            // INSERT o MODIFY
            const newImage = dynamodb.NewImage;
            if (newImage) {
                const doc = {
                    tenant_id: newImage.tenant_id?.S,
                    producto_id: productoId,
                    codigo: newImage.codigo?.S,
                    nombre: newImage.nombre?.S,
                    descripcion: newImage.descripcion?.S,
                    categoria: newImage.categoria?.S,
                    precio: parseFloat(newImage.precio?.N || 0),
                    stock: parseInt(newImage.stock?.N || 0),
                    imagen_url: newImage.imagen_url?.S || '',
                    tags: newImage.tags?.SS || [],
                    creado_en: newImage.creado_en?.S,
                    actualizado_en: newImage.actualizado_en?.S,
                    activo: newImage.activo?.BOOL !== false
                };
                
                console.log(`Indexing product ${productoId} to ES index ${indexName}`);
                await indexToES(indexName, productoId, doc);
            }
        }
    } catch (error) {
        console.error('Error syncing to ES:', error);
        throw error;
    }
};

const indexToES = async (indexName, docId, document) => {
    const url = `${ES_URL}/${indexName}/_doc/${docId}`;
    
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(document);
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: 'PUT',
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
                    console.log(`Successfully indexed to ES: ${res.statusCode}`);
                    resolve(JSON.parse(responseData));
                } else {
                    console.error(`ES indexing failed: ${res.statusCode} ${responseData}`);
                    reject(new Error(`ES responded with ${res.statusCode}: ${responseData}`));
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('HTTP request error:', error);
            reject(error);
        });
        
        req.write(data);
        req.end();
    });
};

const deleteFromES = async (indexName, docId) => {
    const url = `${ES_URL}/${indexName}/_doc/${docId}`;
    
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: 'DELETE'
        };
        
        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                console.log(`ES delete response: ${res.statusCode}`);
                if (responseData) {
                    resolve(JSON.parse(responseData));
                } else {
                    resolve({ acknowledged: true });
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('HTTP request error:', error);
            reject(error);
        });
        
        req.end();
    });
};

exports.lambda_handler = async (event) => {
    console.log('DynamoDB Stream event:', JSON.stringify(event, null, 2));
    
    try {
        for (const record of event.Records) {
            await syncToElasticsearch(record);
        }
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ 
                success: true,
                message: 'Sync completed successfully',
                processedRecords: event.Records.length
            })
        };
    } catch (error) {
        console.error('Error processing stream:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Error processing stream: ' + error.message
            })
        };
    }
};
