
"use client"
import React, { useState, Suspense } from 'react';
import { useProductFilter } from '@/hooks/useProductFilter';
import { FilterAccordion } from './FilterAccordion';
import { ProductList } from './ProductList';
import { ProductModal } from './ProductModal';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import './style.css';

const ProductFilterContent = () => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const {
    // State
    products,
    categories,
    loading,
    error,
    searchQuery,
    activeFilters,
    activeAccordion,
    viewMode,
    selectedProduct,
    isModalOpen,
    
    // Actions
    setActiveAccordion,
    
    // Functions
    handleSearch,
    handleFilterChange,
    handleViewToggle,
    openProductModal,
    closeModal,
    refreshData,
  } = useProductFilter();

  const toggleAccordion = (category: string) => {
    setActiveAccordion(activeAccordion === category ? '' : category);
  };

  const openMobileFilter = () => setIsMobileFilterOpen(true);
  const closeMobileFilter = () => setIsMobileFilterOpen(false);

  return (
    <ErrorBoundary>
      <section className="sei-product-filter" id="sw-product-parts-section">
        <div className="sei-product-filter-container">
          {/* Left Side Sidebar */}
          <div className="sei-product-filter-sidebar">
            <div className="sei-accordion">
              {/* Categories */}
              <FilterAccordion
                title="Categories"
                category="auxiliary"
                isActive={activeAccordion === 'auxiliary'}
                onToggle={toggleAccordion}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                activeFilters={activeFilters}
                searchQuery={searchQuery}
                dataId="133"
                categories={categories}
                filterCount={activeFilters.auxiliary.length}
              />
            </div>

            {/* Contact CTA */}
            <div className="sei-contact-cta">
              <div className="sei-cta-content">
                <h4>Need Help?</h4>
                <p>Contact our sales advisor today for expert guidance on your specific requirements.</p>
                <a href="#" className="sei-btn sei-btn-primary">Contact Sales</a>
              </div>
            </div>
          </div>

          {/* Right Side Product List */}
          <div className="sei-product-filter-Product-List">
            <div className="sei-filters-option">
              {/* Mobile Global Search */}
              <div className="sei-mobile-search" role="search">
                <input 
                  type="text" 
                  className="sei-mobile-global-search-input" 
                  placeholder="Search products..." 
                  aria-label="Search products"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <button className="sei-mobile-global-search-btn" aria-label="Search">
                  <i className="fa fa-search" aria-hidden="true"></i>
                </button>
              </div>
              
              {/* Filter Status and Clear Button */}
        
              
              <div className="sei-col-option-filter">
                <a 
                  href="#" 
                  className={`sei-sw-layout-filter ${viewMode === 'list' ? 'active' : ''}`} 
                  data-view="list"
                  onClick={(e) => {
                    e.preventDefault();
                    handleViewToggle('list');
                  }}
                >
                  <i className="fa fa-th-list" aria-hidden="true"></i>
                </a>
                <a 
                  href="#" 
                  className={`sei-sw-layout-filter ${viewMode === 'grid' ? 'active' : ''}`} 
                  data-view="grid"
                  onClick={(e) => {
                    e.preventDefault();
                    handleViewToggle('grid');
                  }}
                >
                  <i className="fa fa-th" aria-hidden="true"></i>
                </a>
              </div>
            </div>

            {/* Product List */}
            <ProductList
              products={products}
              loading={loading}
              error={error}
              viewMode={viewMode}
              searchQuery={searchQuery}
              onProductClick={openProductModal}
              onRetry={refreshData}
            />
          </div>
        </div>
      </section>

  
      
      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </ErrorBoundary>
  );
};

const ProductFilter = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductFilterContent />
    </Suspense>
  );
};

export default ProductFilter;
