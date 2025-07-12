import React, { useState } from 'react';
import { authService } from '../services/authService';
import { AVAILABLE_TENANTS } from '../constants/tenants';

interface TenantSwitcherProps {
  onTenantChange?: (newTenant: string) => void;
}

export const TenantSwitcher: React.FC<TenantSwitcherProps> = ({ onTenantChange }) => {
  const [currentTenant, setCurrentTenant] = useState(authService.getCurrentTenant() || 'Sin tenant');

  const handleTenantChange = (tenantId: string) => {
    console.log(`🔄 Cambiando de tenant "${currentTenant}" a "${tenantId}"`);
    authService.switchTenant(tenantId);
    setCurrentTenant(tenantId);
    
    if (onTenantChange) {
      onTenantChange(tenantId);
    }
    
    // Recargar la página para aplicar los cambios
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-700 dark:text-gray-400 font-medium">Tenant:</span>
      <select
        value={currentTenant}
        onChange={(e) => handleTenantChange(e.target.value)}
        className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-gray-500 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-blue-400 dark:focus:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <option value="Sin tenant" disabled>Sin tenant</option>
        {AVAILABLE_TENANTS.map((tenant) => (
          <option key={tenant.value} value={tenant.value} className="text-gray-800 dark:text-gray-200">
            {tenant.label}
          </option>
        ))}
      </select>
      <span className="text-xs text-blue-600 dark:text-gray-500 bg-blue-50 dark:bg-transparent px-2 py-1 rounded-full">
        (Testing)
      </span>
    </div>
  );
};
