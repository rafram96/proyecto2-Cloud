const AWS = require('aws-sdk');
const crypto = require('crypto');
const { createResponse, requireAuth } = require('../utils/auth');

const s3 = new AWS.S3();

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Tenant-Id,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
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

        // Handle JSON payload with base64
        const contentTypeHeader = event.headers['Content-Type'] || event.headers['content-type'];
        let imageBuffer;
        let finalContentType;

        if (contentTypeHeader && contentTypeHeader.includes('application/json')) {
            // Parse base64 JSON
            const { base64, mimeType } = JSON.parse(event.body);
            imageBuffer = Buffer.from(base64, 'base64');
            finalContentType = mimeType;
        } else {
            // Parse multipart form data (legacy)
            const body = event.body;
            const boundary = contentTypeHeader.split('boundary=')[1];
            const parts = body.split(`--${boundary}`);
            imageBuffer = null;
            finalContentType = 'image/jpeg';
            for (const part of parts) {
                if (part.includes('Content-Disposition: form-data; name="image"')) {
                    const lines = part.split('\r\n');
                    const ctIndex = lines.findIndex(line => line.includes('Content-Type:'));
                    if (ctIndex !== -1) finalContentType = lines[ctIndex].split('Content-Type: ')[1];
                    const emptyIndex = lines.findIndex(line => line === '');
                    if (emptyIndex !== -1) {
                        const imageData = lines.slice(emptyIndex + 1).join('\r\n');
                        imageBuffer = Buffer.from(imageData, 'binary');
                    }
                    break;
                }
            }
        }

        if (!imageBuffer) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ success: false, error: 'No se pudo procesar la imagen' })
            };
        }

        // Generate unique filename
        const fileExtension = finalContentType.split('/')[1] || 'jpg';
        const fileName = `${tenantId}/${crypto.randomUUID()}.${fileExtension}`;
        const bucketName = process.env.IMAGES_BUCKET;

        // Upload to S3
        const uploadParams = {
            Bucket: bucketName,
            Key: fileName,
            Body: imageBuffer,
            ContentType: finalContentType,
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
