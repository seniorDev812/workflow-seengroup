"use client";

import { useEffect, useState } from 'react';
import './style.css';
import Icon from '../ui/Icon';
import API_CONFIG from '../../../config/api';

// Extend Window interface for API_CONFIG
declare global {
    interface Window {
        API_CONFIG?: typeof API_CONFIG;
    }
}

interface ProductInfo {
    id: string;
    name: string;
    oemNumber: string;
    manufacturer: string;
    category: string;
    price?: number;
}

interface FormData {
    firstName: string;
    lastName: string;
    company: string;
    country: string;
    phone: string;
    email: string;
}

interface ProductRequirement {
    id: string;
    productName: string;
    partNumber: string;
    quantity: number;
    leadTime: string;
    isPreFilled?: boolean;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    company?: string;
    country?: string;
    phone?: string;
    email?: string;
    products?: string;
    submit?: string;
}

interface Notification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    duration?: number;
}

interface Notification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    duration?: number;
}

export default function Contact() {
    const [productData, setProductData] = useState<ProductInfo | null>(null);
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        company: '',
        country: '',
        phone: '',
        email: ''
    });
    const [productRequirements, setProductRequirements] = useState<ProductRequirement[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Handle product data from URL parameters and set API config
    useEffect(() => {
        // Make API configuration available to client-side JavaScript
        if (typeof window !== 'undefined') {
            window.API_CONFIG = API_CONFIG;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const productParam = urlParams.get('product');
        
        if (productParam) {
            try {
                const product = JSON.parse(decodeURIComponent(productParam));
                setProductData(product);
                
                // Auto-add the product to the requirements table
                addProductToTable(product);
            } catch (error) {
                console.error('Error parsing product data:', error);
            }
        }
    }, []);

    // Function to add notification
    const addNotification = (type: 'success' | 'error' | 'info', message: string, duration: number = 5000) => {
        const id = Date.now().toString();
        const notification: Notification = { id, type, message, duration };
        
        setNotifications(prev => [...prev, notification]);
        
        // Auto-remove notification after duration
        setTimeout(() => {
            removeNotification(id);
        }, duration);
    };

    // Function to remove notification
    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    // Function to add product to requirements table
    const addProductToTable = (product: ProductInfo) => {
        const newRequirement: ProductRequirement = {
            id: Date.now().toString(),
            productName: product.name,
            partNumber: product.oemNumber,
            quantity: 1,
            leadTime: '',
            isPreFilled: true
        };
        setProductRequirements(prev => [...prev, newRequirement]);
    };

    // Function to add empty row
    const addEmptyRow = () => {
        const newRequirement: ProductRequirement = {
            id: Date.now().toString(),
            productName: '',
            partNumber: '',
            quantity: 1,
            leadTime: ''
        };
        setProductRequirements(prev => [...prev, newRequirement]);
    };

    // Function to remove row
    const removeRow = (id: string) => {
        setProductRequirements(prev => prev.filter(item => item.id !== id));
    };

    // Function to update product requirement
    const updateProductRequirement = (id: string, field: keyof ProductRequirement, value: string | number) => {
        setProductRequirements(prev => 
            prev.map(item => 
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    // Handle form input changes
    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Validation functions
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Required field validation
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.company.trim()) newErrors.company = 'Company name is required';
        if (!formData.country) newErrors.country = 'Country is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';

        // Format validation
        if (formData.email && !validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (formData.phone && !validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // Product requirements validation
        if (productRequirements.length === 0) {
            newErrors.products = 'At least one product is required';
        } else {
            const invalidProducts = productRequirements.some(req => 
                !req.productName.trim() || !req.leadTime || req.quantity < 1
            );
            if (invalidProducts) {
                newErrors.products = 'Please fill in all product details (name, lead time, and quantity)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            addNotification('error', 'Please fix the errors in the form before submitting.');
            return;
        }

        setIsSubmitting(true);
        addNotification('info', 'Submitting your request...', 3000);

        try {
            // Format data according to backend expectations
            const submissionData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                company: formData.company,
                country: formData.country,
                phone: formData.phone,
                email: formData.email,
                requirements: JSON.stringify(productRequirements),
                productContext: productData ? JSON.stringify(productData) : undefined
            };

            console.log('Submitting form data:', submissionData);

            // Try to submit to backend first, fallback to Next.js API route
            let response;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            try {
                response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTACT}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(submissionData),
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
            } catch (backendError) {
                clearTimeout(timeoutId);
                console.warn('Backend not available, trying Next.js API route:', backendError);
                // Fallback to Next.js API route
                const fallbackController = new AbortController();
                const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 10000);
                
                try {
                    response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(submissionData),
                        signal: fallbackController.signal,
                    });
                    clearTimeout(fallbackTimeoutId);
                } catch {
                    clearTimeout(fallbackTimeoutId);
                    throw new Error('Both backend and API route are unavailable');
                }
            }

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to submit form');
            }

            setIsSubmitted(true);
            addNotification('success', 'Your request has been submitted successfully! We\'ll contact you within 24 hours.');
            
            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                company: '',
                country: '',
                phone: '',
                email: ''
            });
            setProductRequirements([]);
            setErrors({});

        } catch (error) {
            console.error('Form submission error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit form. Please try again.';
            
            // In development, show more detailed error information
            if (process.env.NODE_ENV === 'development') {
                console.error('Detailed error:', error);
            }
            
            setErrors({ submit: errorMessage });
            addNotification('error', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Notification Container */}
            <div className="notification-container">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`notification notification-${notification.type} show`}
                        onClick={() => removeNotification(notification.id)}
                    >
                        <div className="notification-icon">
                            {notification.type === 'success' && <Icon name="icon-check" size={16} />}
                            {notification.type === 'error' && <Icon name="icon-alert" size={16} />}
                            {notification.type === 'info' && <Icon name="icon-spinner" className="animate-spin" size={16} />}
                        </div>
                        <div className="notification-content">
                            <div className="notification-message">{notification.message}</div>
                        </div>
                        <button
                            className="notification-close"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                            }}
                        >
                            <Icon name="icon-cross" size={12} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="seen-contact-form-container">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="seen-contact-form-header">
                        <h1 className="seen-contact-form-title">Get Your Quote</h1>
                        <p className="seen-contact-form-subtitle">
                            Fill out the form below to request a quote for our products and
                            services. Our team will get back to you within 24 hours.
                        </p>
                        
                     
                        
                        {productData && (
                            <div className="seen-contact-product-info">
                                <div className="seen-contact-product-badge">
                                    <Icon name="icon-package" size={16} />
                                    <span>Product Pre-filled</span>
                                </div>
                                <div className="seen-contact-product-details">
                                    <strong>{productData.name}</strong>
                                    <span>OEM: {productData.oemNumber}</span>
                                    <span>Manufacturer: {productData.manufacturer}</span>
                                </div>
                            </div>
                        )}
                    </div>

                 
                    <div className="seen-contact-form-card">
                        
                        {isSubmitted && (
                            <div id="success-message" className="seen-contact-success-message">
                                <Icon name="icon-check" className="mr-2" size={16} />
                                Thank you! Your request has been submitted successfully. We&apos;ll contact
                                you soon.
                            </div>
                        )}
                        
                        {errors.submit && (
                            <div className="seen-contact-error-message">
                                {errors.submit}
                            </div>
                        )}

                        <form id="lead-form" noValidate onSubmit={handleSubmit}>
                           <div className="seen-contact-form-section">
                                <h2 className="seen-contact-section-title">
                                    <Icon name="icon-user" className="text-orange-500" size={16} />
                                    Contact Information
                                </h2>

                                <div className="seen-contact-form-grid">
                                    <div className="seen-contact-form-group">
                                        <label htmlFor="firstName" className="seen-contact-form-label">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            className={`seen-contact-form-input ${errors.firstName ? 'error' : ''}`}
                                            required
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                        />
                                        {errors.firstName && <div className="seen-contact-error-message">{errors.firstName}</div>}
                                    </div>

                                    <div className="seen-contact-form-group">
                                        <label htmlFor="lastName" className="seen-contact-form-label">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            className={`seen-contact-form-input ${errors.lastName ? 'error' : ''}`}
                                            required
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                        />
                                        {errors.lastName && <div className="seen-contact-error-message">{errors.lastName}</div>}
                                    </div>

                                    <div className="seen-contact-form-group">
                                        <label htmlFor="company" className="seen-contact-form-label">
                                            Company Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            className={`seen-contact-form-input ${errors.company ? 'error' : ''}`}
                                            required
                                            value={formData.company}
                                            onChange={(e) => handleInputChange('company', e.target.value)}
                                        />
                                        {errors.company && <div className="seen-contact-error-message">{errors.company}</div>}
                                    </div>

                                    <div className="seen-contact-form-group">
                                        <label htmlFor="country" className="seen-contact-form-label">
                                            Country *
                                        </label>
                                        <select
                                            id="country"
                                            name="country"
                                            className={`seen-contact-form-select ${errors.country ? 'error' : ''}`}
                                            required
                                            value={formData.country}
                                            onChange={(e) => handleInputChange('country', e.target.value)}
                                        >
                                            <option value="">Select Country</option>
                                            <option value="Turkey">Turkey</option>
                                            <option value="United States">United States</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="Germany">Germany</option>
                                            <option value="France">France</option>
                                            <option value="Italy">Italy</option>
                                            <option value="Spain">Spain</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Australia">Australia</option>
                                            <option value="Japan">Japan</option>
                                            <option value="South Korea">South Korea</option>
                                            <option value="China">China</option>
                                            <option value="India">India</option>
                                            <option value="Brazil">Brazil</option>
                                            <option value="Mexico">Mexico</option>
                                            <option value="Netherlands">Netherlands</option>
                                            <option value="Switzerland">Switzerland</option>
                                            <option value="Sweden">Sweden</option>
                                            <option value="Norway">Norway</option>
                                            <option value="Denmark">Denmark</option>
                                            <option value="Finland">Finland</option>
                                            <option value="Poland">Poland</option>
                                            <option value="Czech Republic">Czech Republic</option>
                                            <option value="Austria">Austria</option>
                                            <option value="Belgium">Belgium</option>
                                            <option value="Portugal">Portugal</option>
                                            <option value="Greece">Greece</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.country && <div className="seen-contact-error-message">{errors.country}</div>}
                                    </div>

                                    <div className="seen-contact-form-group">
                                        <label htmlFor="phone" className="seen-contact-form-label">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            className={`seen-contact-form-input ${errors.phone ? 'error' : ''}`}
                                            required
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                        />
                                        {errors.phone && <div className="seen-contact-error-message">{errors.phone}</div>}
                                    </div>

                                    <div className="seen-contact-form-group">
                                        <label htmlFor="email" className="seen-contact-form-label">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className={`seen-contact-form-input ${errors.email ? 'error' : ''}`}
                                            required
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                        />
                                        {errors.email && <div className="seen-contact-error-message">{errors.email}</div>}
                                    </div>
                                </div>
                            </div>

                            {/* Product Requirements Section */}
                            <div className="seen-contact-form-section">
                                <h2 className="seen-contact-section-title">
                                    <Icon name="icon-package" className="text-orange-500" size={16} />
                                    Product Requirements
                                </h2>

                                <div className="seen-contact-table-container">
                                    <table
                                        className="seen-contact-requirements-table"
                                        id="requirements-table"
                                    >
                                        <thead>
                                            <tr>
                                                <th>Product Name</th>
                                                <th>Part Number</th>
                                                <th>Quantity</th>
                                                <th>Lead Time</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody id="requirements-tbody">
                                            {productRequirements.map(req => (
                                                <tr key={req.id} className={req.isPreFilled ? 'pre-filled-product' : ''}>
                                                    <td>
                                                        <input 
                                                            type="text" 
                                                            name="productName[]" 
                                                            value={req.productName} 
                                                            placeholder="Enter product name" 
                                                            required
                                                            onChange={(e) => updateProductRequirement(req.id, 'productName', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input 
                                                            type="text" 
                                                            name="partNumber[]" 
                                                            value={req.partNumber} 
                                                            placeholder="Enter part number"
                                                            onChange={(e) => updateProductRequirement(req.id, 'partNumber', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input 
                                                            type="number" 
                                                            name="quantity[]" 
                                                            value={req.quantity} 
                                                            placeholder="Qty" 
                                                            min="1" 
                                                            required
                                                            onChange={(e) => updateProductRequirement(req.id, 'quantity', parseInt(e.target.value) || 1)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <select name="leadTime[]" required onChange={(e) => updateProductRequirement(req.id, 'leadTime', e.target.value)}>
                                                            <option value="">Select</option>
                                                            <option value="immediate">Immediate</option>
                                                            <option value="1-2 weeks">1-2 weeks</option>
                                                            <option value="2-4 weeks">2-4 weeks</option>
                                                            <option value="1-2 months">1-2 months</option>
                                                            <option value="2+ months">2+ months</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <button type="button" className="remove-row-btn" onClick={() => removeRow(req.id)} aria-label="Remove row">
                                                            <Icon name="icon-trash" size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <button
                                        type="button"
                                        className="seen-contact-add-row-btn"
                                        id="add-row-btn"
                                        onClick={addEmptyRow}
                                    >
                                        <Icon name="icon-plus" size={16} />
                                        Add Another Item
                                    </button>
                                </div>
                                {errors.products && <div className="seen-contact-error-message">{errors.products}</div>}
                            </div>

                            {/* CAPTCHA Section */}
                            <div className="seen-contact-form-section"></div>

                            {/* Submit Button */}
                            <div className="seen-contact-form-section">
                                <button
                                    type="submit"
                                    className="seen-contact-submit-btn"
                                    id="submit-btn"
                                    disabled={isSubmitting}
                                >
                                    <span className="seen-contact-loading" id="loading">
                                        {isSubmitting ? (
                                            <Icon name="icon-spinner" className="animate-spin" size={16} />
                                        ) : (
                                            <Icon name="icon-send" size={16} />
                                        )}
                                    </span>
                                    <span className="seen-contact-btn-text">
                                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </>
    )
}














