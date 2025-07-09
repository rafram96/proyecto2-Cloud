const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Crea una respuesta HTTP estándar con headers CORS
 */
const createResponse = (statusCode, body) => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Tenant-Id,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
};

/**
 * Valida un token JWT y retorna el contexto del usuario
 */
const validateJWT = (event) => {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) throw { status: 401, message: 'Token de autorización requerido' };
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        if (err.name === 'TokenExpiredError') throw { status: 401, message: 'Token expirado' };
        throw { status: 401, message: 'Token inválido' };
    }
};

/**
 * Middleware para validar autenticación en handlers
 */
const requireAuth = (handler) => {
    return async (event, context) => {
        // Manejar CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            return createResponse(200, { message: 'CORS preflight' });
        }

        try {
            // Validar JWT
            const payload = validateJWT(event);
            event.userContext = { user_id: payload.user_id, email: payload.email, tenant_id: payload.tenant_id };

            // Ejecutar handler original
            return await handler(event, context);
        } catch (err) {
            return createResponse(err.status || 500, { error: err.message || 'Error interno' });
        }
    };
};

module.exports = {
    validateJWT,
    createResponse,
    requireAuth
};
