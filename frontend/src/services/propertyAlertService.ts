import { request } from './apiClient';

export interface PropertyAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  shouldNotifyUser: boolean;
}

interface ApiPropertyAlert {
  id?: number | string;
  type: string;
  title?: string;
  message?: string;
  shouldNotifyUser?: boolean;
}

export async function getPropertyAlerts(propertyNumber: string): Promise<PropertyAlert[]> {
  const alerts = await request<ApiPropertyAlert[]>(`/properties/${propertyNumber}/alerts`);
  return alerts.map((alert, index) => ({
    id: String(alert.id ?? `${propertyNumber}-alert-${index}`),
    type: alert.type,
    title: alert.title ?? '',
    message: alert.message ?? '',
    shouldNotifyUser: alert.shouldNotifyUser ?? false,
  }));
}
