import React, { useState } from 'react';
import { authService } from '../services/authService';
import { AVAILABLE_TENANTS } from '../constants/tenants';

interface TenantSwitcherProps {
  onTenantChange?: (newTenant: string) => void;
}

export const TenantSwitcher: React.FC<TenantSwitcherProps> = ({ onTenantChange }) => {
  const currentTenant = authService.getCurrentTenant() || 'Sin tenant';

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-700 dark:text-gray-400 font-medium">Tenant:</span>
      <span className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-gray-200">
        {currentTenant}
      </span>
    </div>
  );
};
