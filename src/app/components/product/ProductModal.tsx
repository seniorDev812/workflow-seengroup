import React from 'react';
import Image from 'next/image';
import { Product } from '@/lib/productsApi';
import { formatPrice } from '@/lib/utils/productUtils';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  if (!product || !isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`sei-mobile-modal-overlay ${isOpen ? 'active' : ''}`} 
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        role="presentation"
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className={`sei-mobile-modal ${isOpen ? 'active' : ''}`} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="productModalTitle"
        onKeyDown={handleKeyDown}
      >
        <div className="sei-mobile-modal-grabber" aria-hidden="true"></div>
        
        <div className="sei-mobile-modal-header">
          <h3 id="productModalTitle">Product Details</h3>
          <button 
            className="sei-mobile-modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="fa fa-times" aria-hidden="true"></i>
          </button>
        </div>
        
        <div className="sei-mobile-modal-content">
          <div className="sei-product-modal-info">
            <div className="sei-product-modal-image">
              {product.imageUrl ? (
                <Image 
                  src={product.imageUrl} 
                  alt={product.name || product.description || 'Product'}
                  width={300}
                  height={200}
                  className="w-full h-auto"
                />
              ) : (
                <div className="sei-product-modal-placeholder">
                  <i className="fa fa-image" aria-hidden="true"></i>
                  <span>No Image Available</span>
                </div>
              )}
            </div>
            
            <div className="sei-product-modal-details">
              <h4 className="sei-product-modal-title">{product.name || product.description}</h4>
              
              {/* Technical Specifications - Highlighted Section */}
              <div className="sei-product-modal-tech-specs">
                <h5 className="sei-tech-specs-title">
                  <i className="fa fa-cog" aria-hidden="true"></i>
                  Technical Specifications
                </h5>
                
                <div className="sei-tech-specs-grid">
                  {product.oemNumber && (
                    <div className="sei-tech-spec-item sei-highlighted">
                      <span className="sei-tech-spec-label">
                        <i className="fa fa-barcode" aria-hidden="true"></i>
                        OEM Number:
                      </span>
                      <span className="sei-tech-spec-value">{product.oemNumber}</span>
                    </div>
                  )}
                  
                  {product.manufacturer && (
                    <div className="sei-tech-spec-item sei-highlighted">
                      <span className="sei-tech-spec-label">
                        <i className="fa fa-industry" aria-hidden="true"></i>
                        Manufacturer:
                      </span>
                      <span className="sei-tech-spec-value">{product.manufacturer}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* General Product Information */}
              <div className="sei-product-modal-specs">
                {product.category && (
                  <div className="sei-spec-item">
                    <span className="sei-spec-label">
                      <i className="fa fa-tags" aria-hidden="true"></i>
                      Category:
                    </span>
                    <span className="sei-spec-value">{product.category.name}</span>
                  </div>
                )}
                
                {product.subcategory && (
                  <div className="sei-spec-item">
                    <span className="sei-spec-label">
                      <i className="fa fa-folder" aria-hidden="true"></i>
                      Subcategory:
                    </span>
                    <span className="sei-spec-value">{product.subcategory.name}</span>
                  </div>
                )}
                
                {product.price && (
                  <div className="sei-spec-item sei-price-item">
                    <span className="sei-spec-label">
                      <i className="fa fa-dollar-sign" aria-hidden="true"></i>
                      Price:
                    </span>
                    <span className="sei-spec-value sei-price">
                      ${formatPrice(product.price)}
                    </span>
                  </div>
                )}
              </div>
              
              {product.description && (
                <div className="sei-product-modal-description">
                  <h5>Description</h5>
                  <p>{product.description}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="sei-product-modal-actions">
            <button 
              className="sei-btn sei-btn-primary"
              onClick={() => {
                // Contact Sales functionality
                const productInfo = {
                  id: product.id,
                  name: product.name || product.description,
                  oemNumber: product.oemNumber,
                  manufacturer: product.manufacturer,
                  category: product.category?.name,
                  subcategory: product.subcategory?.name,
                  price: product.price
                };
                
                // Option 1: Navigate to contact page with product details
                const contactUrl = `/contact?product=${encodeURIComponent(JSON.stringify(productInfo))}`;
                window.open(contactUrl, '_blank');
                
                // Option 2: Open phone dialer (uncomment if you have a sales phone number)
                // const phoneNumber = '+1234567890'; // Replace with your sales number
                // window.open(`tel:${phoneNumber}`, '_self');
                
                // Option 3: Open WhatsApp with product details (uncomment if you have WhatsApp business)
                // const whatsappNumber = '1234567890'; // Replace with your WhatsApp number
                // const message = `Hi, I'm interested in the following product:\n\nProduct: ${product.name || product.description}\nOEM Number: ${product.oemNumber || 'N/A'}\nManufacturer: ${product.manufacturer || 'N/A'}\nCategory: ${product.category?.name || 'N/A'}\nPrice: ${product.price ? `$${formatPrice(product.price)}` : 'Contact for pricing'}\n\nPlease provide more information about availability and pricing.`;
                // window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
                
                // Option 4: Open email client (uncomment if you prefer email)
                // const subject = `Product Inquiry: ${product.name || product.description}`;
                // const body = `Hello,\n\nI'm interested in the following product:\n\nProduct: ${product.name || product.description}\nOEM Number: ${product.oemNumber || 'N/A'}\nManufacturer: ${product.manufacturer || 'N/A'}\nCategory: ${product.category?.name || 'N/A'}\nSubcategory: ${product.subcategory?.name || 'N/A'}\nPrice: ${product.price ? `$${formatPrice(product.price)}` : 'Contact for pricing'}\n\nPlease provide more information about availability and pricing.\n\nThank you!`;
                // window.open(`mailto:sales@yourcompany.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
                
                // Close the modal after action
                onClose();
              }}
            >
              <i className="fa fa-phone" aria-hidden="true"></i>
              Contact Sales
            </button>
            
            <button 
              className="sei-btn sei-btn-secondary"
              onClick={() => {
                // Add to Quote functionality
                const productInfo = {
                  id: product.id,
                  name: product.name || product.description,
                  oemNumber: product.oemNumber,
                  manufacturer: product.manufacturer,
                  category: product.category?.name,
                  subcategory: product.subcategory?.name,
                  price: product.price,
                  quantity: 1
                };
                
                // Store in localStorage for quote management
                const existingQuote = JSON.parse(localStorage.getItem('product-quote') || '[]');
                const existingItemIndex = existingQuote.findIndex((item: { id: string }) => item.id === product.id);
                
                if (existingItemIndex >= 0) {
                  // Update quantity if product already in quote
                  existingQuote[existingItemIndex].quantity += 1;
                } else {
                  // Add new product to quote
                  existingQuote.push(productInfo);
                }
                
                localStorage.setItem('product-quote', JSON.stringify(existingQuote));
                
                // Show success notification (you can use your preferred notification system)
                alert(`"${product.name || product.description}" added to quote!`);
                
                // Close the modal after action
                onClose();
              }}
            >
              <i className="fa fa-plus" aria-hidden="true"></i>
              Add to Quote
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

