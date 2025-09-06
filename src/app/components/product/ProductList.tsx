import React from 'react';
import Image from 'next/image';
import { ProductFilter } from '@/lib/api/productFilterApi';
import { LoadingState } from '@/app/components/LoadingState';

interface ProductListProps {
  products: ProductFilter[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  searchQuery: string;
  onProductClick: (product: ProductFilter) => void;
  onRetry: () => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  error,
  viewMode,
  searchQuery,
  onProductClick,
  onRetry
}) => {
  if (loading) {
    return <LoadingState message="Loading products..." />;
  }

  if (error) {
    return (
      <div className="sei-error-state">
        <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
        <p>{error}</p>
        <button onClick={onRetry} className="sei-btn sei-btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="sei-no-results">
        <i className="fa fa-search" aria-hidden="true"></i>
        <p>
          {searchQuery 
            ? `No products found matching "${searchQuery}"`
            : "No products available in this category"
          }
        </p>
        {searchQuery && (
          <button 
            onClick={() => window.location.reload()}
            className="sei-btn sei-btn-secondary"
          >
            Clear Search
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`sei-product-list sei-sw-right-prod-list-content ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
      {/* Product Details Description */}
      <div className="sei-product-details-discription">
        {/* Product Description Start */}
        <div className="sei-peodct-discription-content">
          <div className="sei-product-img">
            <Image 
              src="/imgs/list.jpg" 
              alt="Product category overview"
              width={400}
              height={300}
              className="sei-product-image"
              priority
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          <div className="sei-product-content-d">
            <h1 className="sei-product-title">Industrial Parts & Components</h1>
            <p className="sei-product-content-c">
              Comprehensive collection of high-quality industrial parts and components 
              for locomotive and heavy machinery applications. Find reliable solutions 
              for your specific requirements.
            </p>
            {/* Results count */}
            <div className="sei-results-count">
              Showing {products.length} products
              {searchQuery && ` for "${searchQuery}"`}
            </div>
          </div>
        </div>
        {/* Product Description End */}
        
        {/* Product Specification Start */}
        <div className="sei-specification-heqadings">
          <h6 className="sei-comman-s-heading sei-number-text">
            <i className="fa fa-barcode" aria-hidden="true"></i>
            OEM NUMBER
          </h6>
          <h6 className="sei-comman-s-heading sei-menufacture-text">
            <i className="fa fa-industry" aria-hidden="true"></i>
            MANUFACTURER
          </h6>
          <h6 className="sei-comman-s-heading sei-discrption-text">
            <i className="fa fa-info-circle" aria-hidden="true"></i>
            DESCRIPTION
          </h6>
          <h6 className="sei-comman-s-heading sei-price-text">
            <i className="fa fa-dollar-sign" aria-hidden="true"></i>
            PRICE
          </h6>
        </div>
        
        <div className="sei-accordion-container">
          {products.map((product) => (
            <div key={product.id} className="sei-accordion-column">
              <div 
                className="sei-accordion-main" 
                onClick={() => onProductClick(product)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${product.description}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onProductClick(product);
                  }
                }}
              >
                <h6 className="sei-comman-s-heading sei-number-text sei-highlighted-cell">
                  <span className="sei-mobile-text-n">OEM Number</span>
                  <span className="sei-cell-content">
                    {product.oemNumber || <span className="sei-no-data">N/A</span>}
                  </span>
                </h6>
                <h6 className="sei-comman-s-heading sei-menufacture-text sei-highlighted-cell">
                  <span className="sei-mobile-text-n">Manufacturer</span>
                  <span className="sei-cell-content">
                    {product.manufacturer || <span className="sei-no-data">N/A</span>}
                  </span>
                </h6>
                <h6 className="sei-comman-s-heading sei-discrption-text">
                  <span className="sei-mobile-text-n">Description</span>
                  <span className="sei-cell-content">{product.description}</span>
                </h6>
                <h6 className="sei-comman-s-heading sei-price-text sei-price-cell">
                  <span className="sei-mobile-text-n">Price</span>
                  <span className="sei-cell-content sei-price-value">
                    {product.price ? `$${product.price.toLocaleString()}` : <span className="sei-contact-price">Contact for Price</span>}
                  </span>
                </h6>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

