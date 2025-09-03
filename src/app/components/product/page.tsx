
"use client"
import React, { useState, Suspense } from 'react';
import { useProductFilter } from '@/hooks/useProductFilter';
import { FilterAccordion } from './FilterAccordion';
import { ProductList } from './ProductList';
import { ProductModal } from './ProductModal';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import Icon from '../ui/Icon';
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
          {/* Left Side Sidebar - Hidden on mobile */}
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
                <a href="/contact" className="sei-btn sei-btn-primary">Contact Sales</a>
              </div>
            </div>
          </div>

          {/* Right Side Product List */}
          <div className="sei-product-filter-Product-List">
            <div className="sei-filters-option">
              {/* Mobile Filter Button */}
              <div className="sei-mobile-filter-btn-container">
                <button 
                  className="sei-mobile-filter-btn"
                  onClick={openMobileFilter}
                  aria-label="Open filters"
                >
                  <Icon name="icon-filter" size={16} />
                  <span>Filters</span>
                  {Object.values(activeFilters).some(filters => filters.length > 0 && !filters.includes('Show All')) && (
                    <span className="sei-mobile-filter-badge">
                      {Object.values(activeFilters).reduce((total, filters) => 
                        total + filters.filter((f: string) => f !== 'Show All').length, 0
                      )}
                    </span>
                  )}
                </button>
              </div>

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
                  <Icon name="icon-search" size={16} />
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
                  <Icon name="icon-list" size={16} />
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
                  <Icon name="icon-grid" size={16} />
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

        {/* Mobile Filter Overlay */}
        {isMobileFilterOpen && (
          <div className="sei-mobile-filter-overlay">
            <div className="sei-mobile-filter-content">
              <div className="sei-mobile-filter-header">
                <h3>Filters</h3>
                <button 
                  className="sei-mobile-filter-close"
                  onClick={closeMobileFilter}
                  aria-label="Close filters"
                >
                  <Icon name="icon-cross" size={20} />
                </button>
              </div>
              
              <div className="sei-mobile-filter-body">
                {/* Mobile Categories Accordion */}
                <div className="sei-mobile-accordion">
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

                {/* Mobile Contact CTA */}
                <div className="sei-mobile-contact-cta">
                  <div className="sei-cta-content">
                    <h4>Need Help?</h4>
                    <p>Contact our sales advisor today for expert guidance on your specific requirements.</p>
                    <a href="/contact" className="sei-btn sei-btn-primary">Contact Sales</a>
                  </div>
                </div>
              </div>

              <div className="sei-mobile-filter-footer">
                <button 
                  className="sei-btn sei-btn-secondary"
                  onClick={() => {
                    // Clear all filters logic
                    Object.keys(activeFilters).forEach(key => {
                      handleFilterChange(key as keyof typeof activeFilters, 'Show All', true);
                    });
                  }}
                >
                  Clear All
                </button>
                <button 
                  className="sei-btn sei-btn-primary"
                  onClick={closeMobileFilter}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
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
