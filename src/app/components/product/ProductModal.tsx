import React from 'react';
import Image from 'next/image';
import { ProductFilter } from '@/lib/api/productFilterApi';
import { formatPrice } from '@/lib/utils/productUtils';

interface ProductModalProps {
  product: ProductFilter | null;
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
              {product.image ? (
                <Image 
                  src={product.image} 
                  alt={product.description}
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
              <h4 className="sei-product-modal-title">{product.description}</h4>
              
              <div className="sei-product-modal-specs">
                <div className="sei-spec-item">
                  <span className="sei-spec-label">OEM Number:</span>
                  <span className="sei-spec-value">{product.oemNumber}</span>
                </div>
                
                <div className="sei-spec-item">
                  <span className="sei-spec-label">Manufacturer:</span>
                  <span className="sei-spec-value">{product.manufacturer}</span>
                </div>
                
                <div className="sei-spec-item">
                  <span className="sei-spec-label">Category:</span>
                  <span className="sei-spec-value">{product.category}</span>
                </div>
                
                <div className="sei-spec-item">
                  <span className="sei-spec-label">Subcategory:</span>
                  <span className="sei-spec-value">{product.subcategory}</span>
                </div>
                
                {product.price && (
                  <div className="sei-spec-item">
                    <span className="sei-spec-label">Price:</span>
                    <span className="sei-spec-value sei-price">
                      ${formatPrice(product.price)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="sei-product-modal-description">
                <h5>Description</h5>
                <p>{product.description}</p>
              </div>
            </div>
          </div>
          
          <div className="sei-product-modal-actions">
            <button 
              className="sei-btn sei-btn-primary"
              onClick={() => {
                // Contact Sales functionality
                const productInfo = {
                  id: product.id,
                  name: product.description,
                  oemNumber: product.oemNumber,
                  manufacturer: product.manufacturer,
                  category: product.category,
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
                // const message = `Hi, I'm interested in ${product.description} (OEM: ${product.oemNumber})`;
                // window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
                
                // Option 4: Open email client (uncomment if you prefer email)
                // const subject = `Product Inquiry: ${product.description}`;
                // const body = `Hello,\n\nI'm interested in the following product:\n\nProduct: ${product.description}\nOEM Number: ${product.oemNumber}\nManufacturer: ${product.manufacturer}\nCategory: ${product.category}\nPrice: ${product.price ? `$${formatPrice(product.price)}` : 'Not specified'}\n\nPlease provide more information about availability and pricing.\n\nThank you!`;
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
                  name: product.description,
                  oemNumber: product.oemNumber,
                  manufacturer: product.manufacturer,
                  category: product.category,
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
                alert(`"${product.description}" added to quote!`);
                
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

