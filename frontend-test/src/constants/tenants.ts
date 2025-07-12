// Constantes compartidas para la aplicación

export const AVAILABLE_TENANTS = [
  { value: 'test1', label: 'test1' },
  { value: 'test2', label: 'test2' },
  { value: 'test3', label: 'test3' },
  { value: 'TADASHI', label: 'TADASHI' }  // Coincide con el registro original
] as const;

export const TENANT_VALUES = AVAILABLE_TENANTS.map(tenant => tenant.value);

export type TenantId = typeof TENANT_VALUES[number];
