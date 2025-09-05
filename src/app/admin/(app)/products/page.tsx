﻿"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Container,
  Grid,
  Card,
  Group,
  Title,
  Button,
  Text,
  Stack,
  ScrollArea,
  ActionIcon,
  TextInput,
  Modal,
  Select,
  Divider,
  Badge,
  Table,
  Tooltip,
  FileInput,
  Skeleton,
  LoadingOverlay,
  Pagination,
  Alert,
  Box,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useAdminPerformance } from '../../hooks/useAdminPerformance';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconBox,
  IconCategory,
  IconRefresh,
  IconSearch,
  IconFilter,
} from "@tabler/icons-react";

// Add client-side only rendering to prevent hydration issues
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Subcategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  oemNumber?: string;
  manufacturer?: string;
  price?: string | number; // Can be string (from API) or number
  imageUrl?: string;
  categoryId: string;
  subcategoryId?: string;
  category?: Category;
  subcategory?: Subcategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Safe extractor to avoid reading value from a null currentTarget
const getInputValue = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLFormElement> | null): string => {
  if (!e) return "";
  const v = e.currentTarget?.value ?? (e.target as HTMLInputElement)?.value ?? "";
  return typeof v === "string" ? v : String(v ?? "");
};

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

const useCache = (key: string, ttl: number = 5 * 60 * 1000) => {
  const getCached = useCallback(() => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }, [key]);

  const setCached = useCallback((data: unknown) => {
    cache.set(key, { data, timestamp: Date.now(), ttl });
  }, [key, ttl]);

  const invalidateCache = useCallback(() => {
    cache.delete(key);
  }, [key]);

  return { getCached, setCached, invalidateCache };
};

export default function AdminProductsPage() {
  // Performance monitoring
  const { trackApiCall, trackUserAction, trackError } = useAdminPerformance('Products Management');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  


  // Cache hooks
  const categoriesCache = useCache('categories', 10 * 60 * 1000); // 10 minutes
  const productsCache = useCache('products', 5 * 60 * 1000); // 5 minutes

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<{
    name: string;
    description: string;
    oemNumber: string;
    manufacturer: string;
    price: string;
    categoryId: string;
    subcategoryId: string;
    imageUrl?: string;
  }>({
    name: "",
    description: "",
    oemNumber: "",
    manufacturer: "",
    price: "",
    categoryId: "",
    subcategoryId: "",
    imageUrl: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [categoryConfirmOpen, setCategoryConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  
  // Bulk operations state
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  // Normalize image URLs to a browser-loadable path
  const getDisplayImageUrl = useCallback((url?: string) => {
    if (!url) return '';
    try {
      const parsed = new URL(url, window.location.origin);
      const pathname = parsed.pathname || '';
      if (pathname.startsWith('/uploads/')) {
        return `/api/proxy${pathname}`;
      }
      return parsed.toString();
    } catch {
      // If it's a plain relative path
      if (url.startsWith('/uploads/')) return `/api/proxy${url}`;
      return url;
    }
  }, []);


  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  // Backend expects DELETE /api/admin/products?id=...
  const deleteProductViaProxy = useCallback(async (productId: string): Promise<Response> => {
    const res = await fetch(`/api/proxy/admin/products?id=${encodeURIComponent(productId)}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return res;
  }, []);

  // Bulk operations functions
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts(new Set());
      setSelectAll(false);
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    
    if (confirm(`Are you sure you want to archive ${selectedProducts.size} selected products? This will hide them from public listings but preserve all data.`)) {
      try {
        const deletePromises = Array.from(selectedProducts).map(id => deleteProductViaProxy(id));
        
        await Promise.all(deletePromises);
        
        notifications.show({
          title: "Success",
          message: `${selectedProducts.size} products archived successfully`,
          color: "green",
        });
        
        setSelectedProducts(new Set());
        setSelectAll(false);
        loadProducts(); // Refresh the list
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to archive some products",
          color: "red",
        });
      }
    }
  };

  const handleBulkToggleStatus = async (isActive: boolean) => {
    if (selectedProducts.size === 0) return;
    
    const action = isActive ? 'activate' : 'deactivate';
    if (confirm(`Are you sure you want to ${action} ${selectedProducts.size} selected products?`)) {
      try {
        const updatePromises = Array.from(selectedProducts).map(id =>
          fetch(`/api/proxy/admin/products/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive })
          })
        );
        
        await Promise.all(updatePromises);
        
        notifications.show({
          title: "Success",
          message: `${selectedProducts.size} products ${action}d successfully`,
          color: "green",
        });
        
        setSelectedProducts(new Set());
        setSelectAll(false);
        loadProducts(); // Refresh the list
      } catch (error) {
        notifications.show({
          title: "Error",
          message: `Failed to ${action} some products`,
          color: "red",
        });
      }
    }
  };

  // Load categories with caching
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      // Check cache first
      const cached = categoriesCache.getCached();
      if (cached) {
        setCategories(cached as Category[]);
        return;
      }

      const response = await fetch(`/api/proxy/admin/categories`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const cats = data.data || [];
        setCategories(cats);
        categoriesCache.setCached(cats);
        
        // Auto-select first category if none selected
        if (!selectedCategoryId && cats.length > 0) {
          setSelectedCategoryId(cats[0].id);
        }
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to load categories",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Network error loading categories",
        color: "red",
      });
    } finally {
      setCategoriesLoading(false);
    }
  }, [categoriesCache, selectedCategoryId]);

  const loadSubcategories = useCallback(async (categoryId: string) => {
    try {
      const response = await fetch(`/api/proxy/admin/categories/${categoryId}/subcategories`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const subcats = data.data || [];
        setSubcategories(subcats);
      } else {
        console.error('Failed to load subcategories');
        setSubcategories([]);
      }
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setSubcategories([]);
    }
  }, []);

  // Load products with caching
  const loadProducts = useCallback(async () => {
    if (!selectedCategoryId) {
      setProducts([]);
      return;
    }

    setProductsLoading(true);
    try {
      const startTime = performance.now();
      
      const response = await fetch(`/api/proxy/admin/products?categoryId=${selectedCategoryId}`, {
        credentials: 'include',
      });
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Track API call performance
      trackApiCall(false, loadTime);
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      } else {
        trackError('load_products', 'Failed to load products');
        notifications.show({
          title: "Error",
          message: "Failed to load products",
          color: "red",
        });
      }
    } catch (error) {
      trackError('load_products', 'Network error loading products');
      notifications.show({
        title: "Error",
        message: "Network error loading products",
        color: "red",
      });
    } finally {
      setProductsLoading(false);
    }
  }, [selectedCategoryId, trackApiCall, trackError]);



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

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const refreshAll = async () => {
    setLoading(true);
    try {
      // Invalidate all caches
      categoriesCache.invalidateCache();
      cache.clear();
      
      await Promise.all([loadCategories(), loadProducts()]);
      notifications.show({
        title: "Success",
        message: "Data refreshed successfully",
        color: "green",
      });
    } finally {
      setLoading(false);
    }
  };

  // Category operations
  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryModalOpen(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setCategoryModalOpen(true);
  };

  const saveCategory = async () => {
    if (!categoryName.trim()) return;

    setLoading(true);
    try {
      const url = editingCategory 
        ? `/api/proxy/admin/categories` 
        : `/api/proxy/admin/categories`;
      const method = editingCategory ? "PATCH" : "POST";
      const body = editingCategory 
        ? { id: editingCategory.id, name: categoryName, description: categoryDescription }
        : { name: categoryName, description: categoryDescription };

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        notifications.show({
          title: "Success",
          message: `Category ${editingCategory ? "updated" : "created"} successfully`,
          color: "green",
        });
        setCategoryModalOpen(false);
        categoriesCache.invalidateCache();
        await loadCategories();
      } else {
        const errorData = await response.json();
        notifications.show({
          title: "Error",
          message: errorData.error || "Failed to save category",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Network error saving category",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCategoryDeleteConfirm = (category: Category) => {
    setCategoryToDelete(category);
    setCategoryConfirmOpen(true);
  };

  const deleteCategory = async (categoryId: string) => {

    setLoading(true);
    try {
      const response = await fetch(`/api/proxy/admin/categories`, {
        method: "DELETE",
        credentials: 'include',
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: categoryId }),
      });

      if (response.ok) {
        notifications.show({
          title: "Success",
          message: "Category deleted successfully",
          color: "green",
        });
        categoriesCache.invalidateCache();
        await loadCategories();
      } else {
        const errorData = await response.json();
        notifications.show({
          title: "Error",
          message: errorData.error || "Failed to delete category",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Network error deleting category",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Product operations
  const openCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      oemNumber: "",
      manufacturer: "",
      price: "",
      categoryId: selectedCategoryId || "",
      subcategoryId: "",
      imageUrl: "",
    });
    setSelectedImage(null);
    setImagePreview("");
    setProductModalOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      oemNumber: product.oemNumber || "",
      manufacturer: product.manufacturer || "",
      price: product.price?.toString() || "",
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId || "",
      imageUrl: product.imageUrl || "",
    });
    setSelectedImage(null);
    setImagePreview(getDisplayImageUrl(product.imageUrl || ""));
    
    // Load subcategories for the product's category
    if (product.categoryId) {
      loadSubcategories(product.categoryId);
    }
    
    setProductModalOpen(true);
  };

  const saveProduct = async () => {
    if (!productForm.name.trim() || !productForm.categoryId) return;

    setLoading(true);
    try {
      const startTime = performance.now();
      let imageUrl = productForm.imageUrl;

      // Upload image if a new one is selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);

        const uploadResponse = await fetch(`/api/proxy/upload/image`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          const rawUrl = (uploadData && uploadData.data && uploadData.data.url) || uploadData?.url || '';

          // Normalize to a safe, same-origin URL (via proxy) to avoid mixed content/CORS issues
          const toProxyUrl = (u: string) => {
            try {
              const parsed = new URL(u, window.location.origin);
              const pathname = parsed.pathname || '';
              return pathname.startsWith('/uploads/') ? `/api/proxy${pathname}` : parsed.toString();
            } catch {
              return u;
            }
          };

          imageUrl = toProxyUrl(rawUrl);
        } else {
          const errorData = await uploadResponse.json();
          notifications.show({
            title: "Error",
            message: errorData.error || "Failed to upload image",
            color: "red",
          });
          return;
        }
      }

      const url = editingProduct 
        ? `/api/proxy/admin/products` 
        : `/api/proxy/admin/products`;
      const method = editingProduct ? "PUT" : "POST";
      
      const productData = editingProduct ? {
        ...productForm,
        id: editingProduct.id,
        price: productForm.price ? parseFloat(productForm.price) : null,
        imageUrl: imageUrl,
      } : {
        ...productForm,
        price: productForm.price ? parseFloat(productForm.price) : null,
        imageUrl: imageUrl,
      };

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const endTime = performance.now();
      const saveTime = endTime - startTime;

      if (response.ok) {
        trackUserAction(editingProduct ? 'edit_product' : 'create_product', true, saveTime);
        notifications.show({
          title: "Success",
          message: `Product ${editingProduct ? "updated" : "created"} successfully`,
          color: "green",
        });
        setProductModalOpen(false);
        cache.clear(); // Invalidate products cache
        await loadProducts();
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.error || "Failed to save product";
        
        // Show validation details if available
        if (errorData.details && Array.isArray(errorData.details)) {
          const validationErrors = errorData.details.map((err: { path: string; msg: string }) => `${err.path}: ${err.msg}`).join(', ');
          errorMessage = `Validation failed: ${validationErrors}`;
        }
        
        trackError('save_product', errorMessage);
        notifications.show({
          title: "Error",
          message: errorMessage,
          color: "red",
        });
      }
    } catch (error) {
      trackError('save_product', 'Network error saving product');
      notifications.show({
        title: "Error",
        message: "Network error saving product",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (product: Product) => {
    setProductToDelete(product);
    setConfirmOpen(true);
  };

  const deleteProduct = async (productId: string) => {
    setLoading(true);
    try {
      const startTime = performance.now();
      
      const response = await deleteProductViaProxy(productId);

      const endTime = performance.now();
      const deleteTime = endTime - startTime;

      if (response.ok) {
        trackUserAction('archive_product', true, deleteTime);
        notifications.show({
          title: "Success",
          message: "Product archived successfully",
          color: "green",
        });
        cache.clear(); // Invalidate products cache
        await loadProducts();
      } else {
        const errorData = await response.json();
        trackError('archive_product', errorData.error || "Failed to archive product");
        notifications.show({
          title: "Error",
          message: errorData.error || "Failed to archive product",
          color: "red",
        });
      }
    } catch (error) {
      trackError('archive_product', 'Network error archiving product');
      notifications.show({
        title: "Error",
        message: "Network error archiving product",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (file: File | null) => {
    setSelectedImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
    }
  };

  // Loading skeletons
  const CategorySkeleton = () => (
    <Card withBorder p="sm" bg="dark.6">
      <Skeleton height={20} width="60%" mb="sm" />
      <Skeleton height={16} width="40%" />
    </Card>
  );

  const ProductRowSkeleton = () => (
    <Table.Tr>
      <Table.Td><Skeleton height={36} width={48} /></Table.Td>
      <Table.Td><Skeleton height={16} width="80%" /></Table.Td>
      <Table.Td><Skeleton height={16} width="60%" /></Table.Td>
      <Table.Td><Skeleton height={16} width="70%" /></Table.Td>
      <Table.Td><Skeleton height={16} width="50%" /></Table.Td>
      <Table.Td><Skeleton height={16} width="60%" /></Table.Td>
      <Table.Td>
        <Group gap={4}>
          <Skeleton height={32} width={32} />
          <Skeleton height={32} width={32} />
        </Group>
      </Table.Td>
    </Table.Tr>
  );

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="md" wrap="wrap" gap="xs">
        <Title order={2}>
          <IconBox size={24} style={{ marginRight: 8 }} /> Products
        </Title>
        <Group gap="xs" wrap="wrap">
          <Button 
            leftSection={<IconRefresh size={16} />} 
            variant="light" 
            onClick={refreshAll} 
            loading={loading} 
            size="sm"
          >
            Refresh
          </Button>
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={openCreateCategory} 
            color="brand" 
            size="sm"
          >
            New Category
          </Button>
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={openCreateProduct} 
            disabled={!selectedCategoryId} 
            size="sm"
          >
            New Product
          </Button>
        </Group>
      </Group>

      <ClientOnly>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 4, lg: 3 }}>
          <Card withBorder p="sm" bg="dark.6">
            <Group mb="sm">
              <IconCategory size={18} />
              <Title order={4}>Categories</Title>
            </Group>
            <ScrollArea style={{ height: 500 }}>
              <Stack>
                {categoriesLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <CategorySkeleton key={i} />
                  ))
                ) : categories.length > 0 ? (
                  categories.map((c) => (
                    <Card key={c.id} withBorder p="sm" bg={selectedCategoryId === c.id ? "dark.5" : "dark.6"}>
                      <Group justify="space-between" align="center">
                        <div style={{ cursor: "pointer" }} onClick={() => setSelectedCategoryId(c.id)}>
                          <Text fw={600} size="sm">{c.name}</Text>
                          <Text size="xs" c="dimmed">{c.slug}</Text>
                        </div>
                        <Group gap={4}>
                          <Tooltip label="Edit">
                            <ActionIcon variant="subtle" onClick={() => openEditCategory(c)} size="sm">
                              <IconEdit size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Delete">
                            <ActionIcon variant="subtle" color="red" onClick={() => openCategoryDeleteConfirm(c)} size="sm">
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Group>
                    </Card>
                  ))
                ) : (
                  <Text c="dimmed">No categories yet.</Text>
                )}
              </Stack>
            </ScrollArea>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 8, lg: 9 }}>
          <Card withBorder p="md" bg="dark.6">
            <Group justify="space-between" mb="sm" wrap="wrap" gap="xs">
              <Title order={4}>{selectedCategory ? selectedCategory.name : "Products"}</Title>
              {selectedCategory && (
                <Badge variant="light">{filteredProducts.length} items</Badge>
              )}
            </Group>
            
            {/* Search and Filter */}
            <Group mb="sm" gap="xs">
              <TextInput
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(getInputValue(e))}
                leftSection={<IconSearch size={16} />}
                style={{ flex: 1 }}
                size="sm"
              />
            </Group>


            
            <Divider mb="sm" />
            
            <Box pos="relative">
              <LoadingOverlay visible={productsLoading} />
              <ScrollArea>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Image</Table.Th>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>OEM Number</Table.Th>
                      <Table.Th>Manufacturer</Table.Th>
                      <Table.Th>Price</Table.Th>
                      <Table.Th>Category</Table.Th>
                      <Table.Th>Subcategory</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {productsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <ProductRowSkeleton key={i} />
                      ))
                    ) : paginatedProducts.length > 0 ? (
                      paginatedProducts.map((p) => (
                        <Table.Tr key={p.id}>
                          <Table.Td>
                            {p.imageUrl ? (
                              <img 
                                src={getDisplayImageUrl(p.imageUrl)} 
                                alt={p.name} 
                                style={{ 
                                  width: 48, 
                                  height: 36, 
                                  objectFit: 'cover', 
                                  borderRadius: 4 
                                }} 
                              />
                            ) : (
                              <div style={{ 
                                width: 48, 
                                height: 36, 
                                background: 'var(--mantine-color-dark-5)', 
                                borderRadius: 4 
                              }} />
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" style={{ 
                              maxWidth: 120, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}>
                              {p.name}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" style={{ 
                              maxWidth: 100, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}>
                              {p.oemNumber || '-'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" style={{ 
                              maxWidth: 120, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}>
                              {p.manufacturer || '-'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" style={{ 
                              maxWidth: 80, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}>
                              {p.price ? `$${(() => {
                                try {
                                  const priceValue = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
                                  return isNaN(priceValue) ? '0.00' : priceValue.toFixed(2);
                                } catch {
                                  return '0.00';
                                }
                              })()}` : '-'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" style={{ 
                              maxWidth: 100, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}>
                              {p.category?.name || '-'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" style={{ 
                              maxWidth: 100, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}>
                              {p.subcategory?.name || '-'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant={p.isActive ? "filled" : "light"} color={p.isActive ? "green" : "gray"}>
                              {p.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap={4} justify="flex-end">
                              <Tooltip label="Edit">
                                <ActionIcon variant="light" onClick={() => openEditProduct(p)} size="sm">
                                  <IconEdit size={14} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Archive">
                                <ActionIcon variant="light" color="red" onClick={() => openDeleteConfirm(p)} size="sm">
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={7}>
                          <Text c="dimmed" ta="center" py="md">
                            {searchTerm ? "No products match your search" : "No products in this category yet"}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Group justify="center" mt="md">
                  <Pagination
                    total={totalPages}
                    value={currentPage}
                    onChange={setCurrentPage}
                    size="sm"
                  />
                </Group>
              )}
            </Box>
          </Card>
        </Grid.Col>
      </Grid>
      </ClientOnly>

      {/* Category Modal */}
      <Modal opened={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} title={editingCategory ? "Edit Category" : "New Category"}>
        <Stack>
          <TextInput
            label="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(getInputValue(e))}
            placeholder="Enter category name"
            required
          />
          <TextInput
            label="Category Description (optional)"
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(getInputValue(e))}
            placeholder="Enter category description"
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setCategoryModalOpen(false)}>Cancel</Button>
            <Button onClick={saveCategory} loading={loading}>Save</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Product Modal */}
      <Modal opened={productModalOpen} onClose={() => setProductModalOpen(false)} title={editingProduct ? "Edit Product" : "New Product"} size="lg">
        <Stack>
          <TextInput
            label="Name"
            value={productForm.name || ""}
            onChange={(e) => setProductForm((s) => ({ ...s, name: getInputValue(e) }))}
            required
          />
          <TextInput
            label="Description"
            value={productForm.description || ""}
            onChange={(e) => setProductForm((s) => ({ ...s, description: getInputValue(e) }))}
            placeholder="Enter product description"
          />
          
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="OEM Number"
                value={productForm.oemNumber || ""}
                onChange={(e) => setProductForm((s) => ({ ...s, oemNumber: getInputValue(e) }))}
                placeholder="Enter OEM part number"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Manufacturer"
                value={productForm.manufacturer || ""}
                onChange={(e) => setProductForm((s) => ({ ...s, manufacturer: getInputValue(e) }))}
                placeholder="Enter manufacturer name"
              />
            </Grid.Col>
          </Grid>
          
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Price"
                value={productForm.price || ""}
                onChange={(e) => setProductForm((s) => ({ ...s, price: getInputValue(e) }))}
                placeholder="e.g., 99.99"
                type="number"
                step="0.01"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Category"
                value={productForm.categoryId}
                onChange={(value) => {
                  setProductForm((s) => ({ ...s, categoryId: value || "", subcategoryId: "" }));
                  // Load subcategories when category changes
                  if (value) {
                    loadSubcategories(value);
                  }
                }}
                data={categories.map((c) => ({ value: c.id, label: c.name }))}
                required
              />
            </Grid.Col>
          </Grid>
          
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Subcategory"
                value={productForm.subcategoryId}
                onChange={(value) => setProductForm((s) => ({ ...s, subcategoryId: value || "" }))}
                data={subcategories.map((s) => ({ value: s.id, label: s.name }))}
                placeholder="Select a subcategory (optional)"
                disabled={!productForm.categoryId}
              />
            </Grid.Col>
          </Grid>
          
          <FileInput
            label="Product Image"
            placeholder="Choose an image file"
            accept="image/*"
            value={selectedImage}
            onChange={handleImageSelect}
            clearable
          />
          
          {imagePreview && (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '200px', 
                  objectFit: 'cover',
                  borderRadius: '8px'
                }} 
              />
            </div>
          )}
          
          <TextInput
            label="Image URL (optional - for external images)"
            value={productForm.imageUrl || ""}
            onChange={(e) => setProductForm((s) => ({ ...s, imageUrl: getInputValue(e) }))}
            placeholder="https://example.com/image.jpg"
            description="Use this field if you want to use an external image URL instead of uploading a file"
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setProductModalOpen(false)}>Cancel</Button>
            <Button onClick={saveProduct} loading={loading}>Save</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal opened={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Delete" centered>
        <Stack>
          <Alert color="red" icon={<IconTrash size={16} />}>
            Are you sure you want to delete the product <strong>&quot;{productToDelete?.name}&quot;</strong>? 
            <Text size="sm" mt="xs">
              This action cannot be undone. The product will be permanently deleted from the database.
            </Text>
          </Alert>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button 
              color="red" 
              onClick={() => {
                if (productToDelete) {
                  deleteProduct(productToDelete.id);
                  setConfirmOpen(false);
                }
              }}
              loading={loading}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Category Delete Confirmation Modal */}
      <Modal opened={categoryConfirmOpen} onClose={() => setCategoryConfirmOpen(false)} title="Confirm Delete Category" centered>
        <Stack>
          <Alert color="red" icon={<IconTrash size={16} />}>
            Are you sure you want to delete the category <strong>&quot;{categoryToDelete?.name}&quot;</strong>? 
            <Text size="sm" mt="xs">
              This action cannot be undone. The category will be permanently deleted from the database.
            </Text>
          </Alert>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setCategoryConfirmOpen(false)}>Cancel</Button>
            <Button 
              color="red" 
              onClick={() => {
                if (categoryToDelete) {
                  deleteCategory(categoryToDelete.id);
                  setCategoryConfirmOpen(false);
                }
              }}
              loading={loading}
            >
              Delete Category
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}



