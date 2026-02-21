import { ApiListResult } from '../types/common.types';
import { Category, Product } from '../types/product.types';
import { apiRequest } from './client';

export const catalogApi = {
  listProducts: (params: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
    return apiRequest<ApiListResult<Product>>(`/products?${qs.toString()}`);
  },
  listCategories: () => apiRequest<Category[]>('/categories'),
};
