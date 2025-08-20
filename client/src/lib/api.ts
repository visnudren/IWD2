import { queryClient } from "./queryClient";

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

export async function apiRequest(
  url: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText || response.statusText}`);
  }

  return response;
}

export async function fetchJson<T>(url: string, options?: ApiRequestOptions): Promise<T> {
  const response = await apiRequest(url, options);
  return response.json();
}

export function invalidateQueries(queryKey: string[]) {
  queryClient.invalidateQueries({ queryKey });
}

// Utility functions for common API operations
export const studentApi = {
  getAll: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return fetchJson(`/api/students?${params}`);
  },
  
  getById: (id: string) => fetchJson(`/api/students/${id}`),
  
  create: (data: any) => 
    apiRequest('/api/students', { method: 'POST', body: data }),
  
  update: (id: string, data: any) => 
    apiRequest(`/api/students/${id}`, { method: 'PUT', body: data }),
  
  delete: (id: string) => 
    apiRequest(`/api/students/${id}`, { method: 'DELETE' }),
  
  export: () => window.open('/api/students/export', '_blank'),
  
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch('/api/students/import', {
      method: 'POST',
      body: formData,
    });
  }
};

export const moduleApi = {
  getAll: (programme?: string) => {
    const params = programme ? `?programme=${encodeURIComponent(programme)}` : '';
    return fetchJson(`/api/modules${params}`);
  },
  
  getById: (id: string) => fetchJson(`/api/modules/${id}`),
  
  create: (data: any) => 
    apiRequest('/api/modules', { method: 'POST', body: data }),
  
  update: (id: string, data: any) => 
    apiRequest(`/api/modules/${id}`, { method: 'PUT', body: data }),
  
  delete: (id: string) => 
    apiRequest(`/api/modules/${id}`, { method: 'DELETE' })
};

export const dashboardApi = {
  getMetrics: () => fetchJson('/api/dashboard/metrics'),
  getCGPATrends: () => fetchJson('/api/dashboard/cgpa-trends'),
  getInsights: () => fetchJson('/api/dashboard/insights'),
  getAtRiskStudents: () => fetchJson('/api/dashboard/at-risk-students'),
  getRecentActivity: (limit: number = 10) => 
    fetchJson(`/api/dashboard/recent-activity?limit=${limit}`)
};
