const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PRODUCTS_BASE_URL = import.meta.env.VITE_PRODUCTS_API_URL;

/**
 * Wrapper genérico para llamadas al API con fetch.
 * Inyecta la base URL y el token JWT si está disponible.
 */
export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw payload;
  }
  return payload;
}

/**
 * Wrapper específico para llamadas al API de productos.
 * Usa VITE_PRODUCTS_API_URL para evitar problemas de CORS.
 */
export async function requestProducts<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenantId') || 'tenant1'; // valor por defecto
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-Id': tenantId,
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${PRODUCTS_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  
  console.log(`📡 Request to ${PRODUCTS_BASE_URL}${path} - Status: ${response.status}`);
  
  const payload = await response.json().catch(() => ({}));
  console.log(`📦 Response payload:`, payload);
  
  if (!response.ok) {
    console.error(`❌ Request failed: ${response.status} - ${response.statusText}`);
    throw payload;
  }
  return payload;
}
