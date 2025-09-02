import { useState, useCallback, useMemo } from 'react';
import { notifications } from '@mantine/notifications';
import { fetchProducts, fetchCategories } from '@/lib/productsApi';
import { debounce, sanitizeSearchInput, validateSearchInput } from '@/lib/utils/productUtils';
import { useUrlState } from './useUrlState';

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: string | number;
  imageUrl?: string;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export const useProducts = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [pageSize] = useState(12);
  const [error, setError] = useState<string | null>(null);

  // URL state management
  const {
    searchTerm,
    categoryId: selectedCategoryId,
    page: currentPage,
    updateSearchTerm,
    updateCategoryId,
    updatePage,
  } = useUrlState();

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  // Load categories
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setError(null);
    try {
      const response = await fetchCategories();
      if (response.success) {
        const cats = response.data || [];
        setCategories(cats);

        // Auto-select first category if none selected
        if (!selectedCategoryId && cats.length > 0) {
          updateCategoryId(cats[0].id);
        }
      } else {
        throw new Error(response.error || 'Failed to load categories');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load categories';
      setError(errorMessage);
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setCategoriesLoading(false);
    }
  }, [selectedCategoryId, updateCategoryId]);

  // Load products
  const loadProducts = useCallback(async () => {
    if (!selectedCategoryId) {
      setProducts([]);
      return;
    }

    setProductsLoading(true);
    setError(null);
    try {
      const response = await fetchProducts({
        categoryId: selectedCategoryId,
        page: currentPage,
        limit: pageSize
      });
      
      if (response.success) {
        const prods = response.data || [];
        setProducts(prods);
      } else {
        throw new Error(response.error || 'Failed to load products');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load products';
      setError(errorMessage);
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setProductsLoading(false);
    }
  }, [selectedCategoryId, currentPage, pageSize]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((...args: unknown[]) => {
      const term = args[0] as string;
      const sanitized = sanitizeSearchInput(term);
      if (validateSearchInput(sanitized)) {
        updateSearchTerm(sanitized);
      }
    }, 300),
    [updateSearchTerm]
  );

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Filtered and paginated products
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
    );
  }, [products, searchTerm]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  // Refresh data
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadCategories(), loadProducts()]);
      notifications.show({
        title: "Success",
        message: "Products refreshed successfully",
        color: "green",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadProducts]);

  // Retry loading
  const retryLoad = useCallback(() => {
    if (error) {
      refreshData();
    }
  }, [error, refreshData]);

  return {
    // State
    categories,
    selectedCategoryId,
    products,
    loading,
    categoriesLoading,
    productsLoading,
    searchTerm,
    currentPage,
    pageSize,
    error,
    selectedCategory,
    filteredProducts,
    paginatedProducts,
    totalPages,
    
    // Actions
    setSelectedCategoryId: updateCategoryId,
    setCurrentPage: updatePage,
    loadCategories,
    loadProducts,
    handleSearchChange,
    refreshData,
    retryLoad,
  };
};

