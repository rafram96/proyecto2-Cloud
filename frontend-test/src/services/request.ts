const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
