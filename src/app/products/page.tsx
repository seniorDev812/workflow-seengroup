"use client";

import React, { useEffect, Suspense, useState } from "react";
import {
  Container,
  Title,
  Text,
  Grid,
  Group,
  Select,
  LoadingOverlay,
  Pagination,
  Box,
  Alert,
  Button,
  TextInput,
} from "@mantine/core";
import { IconSearch, IconRefresh } from "@tabler/icons-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCardSkeleton } from "@/app/components/Skeletons";
import { ProductCard } from "@/app/components/ProductCard";
import { ProductModal } from "@/app/components/product/ProductModal";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";

function ProductsPageContent() {
  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    categories,
    selectedCategoryId,
    loading,
    categoriesLoading,
    productsLoading,
    searchTerm,
    currentPage,
    totalPages,
    selectedCategory,
    paginatedProducts,
    setSelectedCategoryId,
    setCurrentPage,
    loadCategories,
    loadProducts,
    handleSearchChange,
    refreshData,
  } = useProducts();

  // Handle product selection
  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <ErrorBoundary>
      <Container size="xl" py="xl">
        <Group justify="space-between" mb="md" wrap="wrap" gap="xs">
          <div>
            <Title order={2}>Products</Title>
            <Text c="dimmed" size="sm">Browse parts and components by category</Text>
          </div>
          <Group gap="xs" wrap="wrap">
            <Select
              placeholder="Select category"
              data={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={selectedCategoryId}
              onChange={(v) => setSelectedCategoryId(v || '')}
              w={{ base: "100%", xs: 260 }}
              disabled={categoriesLoading}
              aria-label="Select product category"
            />
            <TextInput
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              w={{ base: "100%", xs: 200 }}
              aria-label="Search products"
            />
            <Button
              className="btn btn-secondary"
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={refreshData}
              loading={loading}
              aria-label="Refresh products"
            >
              Refresh
            </Button>
          </Group>
        </Group>

        <Text size="sm" mb="sm" className="text-light">
          {selectedCategory ? selectedCategory.name : "All"} — {paginatedProducts.length} items
        </Text>
        <Box pos="relative">
          <LoadingOverlay visible={loading} />

          <Grid>
            {productsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                  <ProductCardSkeleton />
                </Grid.Col>
              ))
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <Grid.Col key={product.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <ProductCard
                    product={{
                      id: product.id,
                      name: product.name || product.description || 'Product',
                      description: product.description,
                      price: product.price,
                      imageUrl: product.imageUrl,
                      category: product.category
                    }}
                    onClick={() => handleProductClick(product)}
                  />
                </Grid.Col>
              ))
            ) : (
              <Grid.Col span={12}>
                <Alert color="gray" title="No products found">
                  {searchTerm ? "No products match your search criteria" : "No products available in this category"}
                </Alert>
              </Grid.Col>
            )}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Group justify="center" mt="xl">
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={setCurrentPage}
                size="md"
                aria-label="Product pagination"
              />
            </Group>
          )}
        </Box>

        {/* Product Modal */}
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      </Container>
    </ErrorBoundary>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}



