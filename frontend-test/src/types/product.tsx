// Definición alineada con data-model y API
export interface Product {
  tenant_id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
  imagen_url: string;
  tags: string[];
  activo: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

/**
 * Respuesta genérica de API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}