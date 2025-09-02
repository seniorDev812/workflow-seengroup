const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface ProductFilter {
  id: string;
  oemNumber: string;
  manufacturer: string;
  description: string;
  category: string;
  subcategory: string;
  image?: string;
  price?: string | number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilterCategory {
  id: string;
  name: string;
  slug: string;
  subcategories: FilterSubcategory[];
}

export interface FilterSubcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface FilterResponse {
  success: boolean;
  data: ProductFilter[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: FilterCategory[];
  error?: string;
}

// Fetch products with advanced filtering
export async function fetchFilteredProducts(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  manufacturer?: string;
  oemNumber?: string;
  filters?: Record<string, string[]>;
}): Promise<FilterResponse> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.category) searchParams.append('category', params.category);
    if (params.subcategory) searchParams.append('subcategory', params.subcategory);
    if (params.manufacturer) searchParams.append('manufacturer', params.manufacturer);
    if (params.oemNumber) searchParams.append('oemNumber', params.oemNumber);
    
    // Add filter parameters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, values]) => {
        if (values.length > 0) {
          searchParams.append(`filter_${key}`, values.join(','));
        }
      });
    }

    const response = await fetch(`${BACKEND_URL}/api/products/filter?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching filtered products:', error);
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      },
      error: error instanceof Error ? error.message : 'Failed to fetch products'
    };
  }
}

// Fetch filter categories
export async function fetchFilterCategories(): Promise<CategoriesResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/products/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching filter categories:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch categories'
    };
  }
}

// Fetch manufacturers
export async function fetchManufacturers(): Promise<{ success: boolean; data: string[]; error?: string }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/products/manufacturers`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch manufacturers'
    };
  }
}

// Search products with autocomplete
export async function searchProductsAutocomplete(query: string): Promise<{ success: boolean; data: string[]; error?: string }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/products/search/autocomplete?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch suggestions'
    };
  }
}

