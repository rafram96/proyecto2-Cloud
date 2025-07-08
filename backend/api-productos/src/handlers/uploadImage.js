const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { createResponse, requireAuth } = require('../utils/auth');

const s3 = new AWS.S3();

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Tenant-Id',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
    'Content-Type': 'application/json'
};

const baseHandler = async (event, context) => {
    try {
        console.log('Upload image event:', event);

        // Manejar preflight OPTIONS
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: ''
            };
        }

        const userContext = event.userContext;
        const tenantId = userContext.tenant_id;

        // Parse multipart form data
        const body = event.body;
        const boundary = event.headers['content-type']?.split('boundary=')[1] || 
                        event.headers['Content-Type']?.split('boundary=')[1];
        
        if (!body || !boundary) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: 'No se encontró archivo de imagen'
                })
            };
        }

        // Extract image data from multipart form
        const parts = body.split(`--${boundary}`);
        let imageBuffer = null;
        let contentType = 'image/jpeg';

        for (const part of parts) {
            if (part.includes('Content-Disposition: form-data; name="image"')) {
                const lines = part.split('\r\n');
                const contentTypeIndex = lines.findIndex(line => line.includes('Content-Type:'));
                if (contentTypeIndex !== -1) {
                    contentType = lines[contentTypeIndex].split('Content-Type: ')[1];
                }
                
                // Get binary data (after headers)
                const emptyLineIndex = lines.findIndex(line => line === '');
                if (emptyLineIndex !== -1) {
                    const imageData = lines.slice(emptyLineIndex + 1).join('\r\n');
                    imageBuffer = Buffer.from(imageData, 'binary');
                }
                break;
            }
        }

        if (!imageBuffer) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: 'No se pudo procesar la imagen'
                })
            };
        }

        // Generate unique filename
        const fileExtension = contentType.split('/')[1] || 'jpg';
        const fileName = `${tenantId}/${uuidv4()}.${fileExtension}`;
        const bucketName = process.env.IMAGES_BUCKET;

        // Upload to S3
        const uploadParams = {
            Bucket: bucketName,
            Key: fileName,
            Body: imageBuffer,
            ContentType: contentType,
            ACL: 'public-read'
        };

        const uploadResult = await s3.upload(uploadParams).promise();
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                message: 'Imagen subida exitosamente',
                data: {
                    imagen_url: uploadResult.Location,
                    key: fileName
                }
            })
        };

    } catch (error) {
        console.error('Error uploading image:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Error interno del servidor al subir imagen'
            })
        };
    }
};

// Exportar con requireAuth
exports.lambda_handler = requireAuth(baseHandler);
