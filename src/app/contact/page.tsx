﻿"use client";

import React, { useState, useEffect, useRef } from 'react';
import Header from "../components/header";
import Footer from "../components/footer";
import Icon from "../components/ui/Icon";
import '../../../public/css/style.css';
import '../../../public/css/tailwind.css';
import Script from 'next/script';
import Contact from "../components/contact/page";

export default function ContactPage() {
    // Refs for performance optimization
    const tickingRef = useRef(false);
    const styleRef = useRef<HTMLStyleElement | null>(null);

    // Scroll-based header background management for contact page
    useEffect(() => {
        // Inject dynamic CSS styles
        const injectStyles = () => {
            if (styleRef.current) return; // Prevent duplicate injection
            
            const style = document.createElement('style');
            style.textContent = `
                .header-bottom {
                    transition: background-color 0.3s ease !important;
                }
                .header-bottom[style*="background-color"] {
                    background-color: var(--header-bg-color) !important;
                }
                .header-bottom.bg-active {
                    background-color: #5f5f5f !important;
                }
                .header-bottom.bg-transparent {
                    background-color: transparent !important;
                }
            `;
            document.head.appendChild(style);
            styleRef.current = style;
        };

        // Get DOM elements for contact page
        const getElements = () => {
            return {
                headerBottom: document.querySelector('.header-bottom'),
                mainField: document.querySelector('.main-field'),
                footerField: document.querySelector('.footer-field')
            };
        };

        // Check if element is in viewport
        const isElementInViewport = (element: Element | null): boolean => {
            if (!element) return false;
            const rect = element.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom >= 0
            );
        };

        // Check if element has been passed (completely out of view)
        // const hasPassedElement = (element: Element | null): boolean => {
        //     if (!element) return false;
        //     const rect = element.getBoundingClientRect();
        //     return rect.bottom < 0;
        // };

        // Update header background based on scroll position for contact page
        const updateHeaderBackground = () => {
            try {
                const elements = getElements();
                const { headerBottom, mainField, footerField } = elements;

                if (!headerBottom) {
                    return;
                }

                // Check section visibility
                const mainInView = isElementInViewport(mainField);
                const footerInView = isElementInViewport(footerField);

                // Apply background color logic for contact page
                if (mainInView) {
                    // Main section (main-field home-animation) is visible - always use #5f5f5f
                    headerBottom.classList.add('bg-active');
                    headerBottom.classList.remove('bg-transparent');
                    (headerBottom as HTMLElement).style.setProperty('--header-bg-color', '#5f5f5f');
                    (headerBottom as HTMLElement).style.backgroundColor = '#5f5f5f';
                } else if (footerInView && !mainInView) {
                    // Footer is visible and main section is not - make header transparent
                    headerBottom.classList.remove('bg-active');
                    headerBottom.classList.add('bg-transparent');
                    (headerBottom as HTMLElement).style.setProperty('--header-bg-color', 'transparent');
                    (headerBottom as HTMLElement).style.backgroundColor = 'transparent';
                } else {
                    // Default state - add background for better readability
                    headerBottom.classList.add('bg-active');
                    headerBottom.classList.remove('bg-transparent');
                    (headerBottom as HTMLElement).style.setProperty('--header-bg-color', '#5f5f5f');
                    (headerBottom as HTMLElement).style.backgroundColor = '#5f5f5f';
                }
            } catch (error) {
                console.error('Contact header background update failed:', error);
            }
        };

        // Throttled scroll handler for performance
        const requestTick = () => {
            if (!tickingRef.current) {
                requestAnimationFrame(() => {
                    updateHeaderBackground();
                    tickingRef.current = false;
                });
                tickingRef.current = true;
            }
        };

        // Initialize
        const initializeHeaderBackground = () => {
            injectStyles();
            
            // Wait for DOM elements to be available
            const checkElements = () => {
                const elements = getElements();
                if (elements.headerBottom) {
                    updateHeaderBackground();
                    window.addEventListener('scroll', requestTick, { passive: true });
                    window.addEventListener('resize', () => {
                        setTimeout(updateHeaderBackground, 100);
                    }, { passive: true });
                } else {
                    // Retry after a short delay if elements aren't ready
                    setTimeout(checkElements, 100);
                }
            };
            
            checkElements();
        };

        // Start initialization after a short delay to ensure DOM is ready
        const initTimer = setTimeout(initializeHeaderBackground, 100);

        // Cleanup function
        return () => {
            clearTimeout(initTimer);
            window.removeEventListener('scroll', requestTick);
            window.removeEventListener('resize', updateHeaderBackground);
            
            // Remove injected styles
            if (styleRef.current) {
                document.head.removeChild(styleRef.current);
                styleRef.current = null;
            }
            
            // Reset header background
            const headerBottom = document.querySelector('.header-bottom');
            if (headerBottom) {
                headerBottom.classList.remove('bg-active', 'bg-transparent');
                (headerBottom as HTMLElement).style.removeProperty('--header-bg-color');
                (headerBottom as HTMLElement).style.removeProperty('background-color');
                (headerBottom as HTMLElement).style.removeProperty('transition');
            }
        };
    }, []); // Empty dependency array - runs once on mount

    return (
        <>
            <Header />
            <div className="block">
                <div id="smooth-wrapper" className="block">
                    <div id="smooth-content">
                      <main className="main-field home-animation" style={{ paddingTop: '140px' }}>
                         <Contact />
                        </main>
                        <Footer />
                    </div>
                </div>
                <div className="bg-overlay-general fixed left-0 top-0 z-[90] opacity-0 invisible duration-500 [&amp;.active]:opacity-100 [&amp;.active]:visible [&amp;.black]:bg-black/30 w-full h-full group"></div>

                <div className="cookie-box fixed top-auto bottom-[20px] right-[20px] left-[20px] mr-0 ml-auto w-fit max-w-[550px] md:max-w-full z-[200] duration-450 xs:w-full xs:left-0 xs:bottom-0 xs:right-0 bg-cookie p-[30px] rounded-[20px] xs:rounded-none translate-y-[150%] [&amp;.accepted]:opacity-0 [&amp;.accepted]:invisible [&amp;.accepted]:translate-y-[250%] sm:sm:max-h-[calc(100dvh-40px)] sm:scrollbar sm:scrollbar-w-[5px] sm:scrollbar-track-rounded-[5px] sm:scrollbar-thumb-rounded-[5px] sm:scrollbar-thumb-primary sm:scrollbar-track-primary/10 sm:overflow-x-hidden sm:overflow-y-auto accepted">
                    <div className="close close-cookie absolute right-[20px] top-[20px] cursor-pointer group/close">
                        <Icon
                            name="icon-cross"
                            className="group-hover/close:text-primary group-hover/close:rotate-90 text-white text-[14px] h-[14px] block leading-none duration-350"
                            size={14}
                        />
                    </div>
                    <div className="text-field text-white">
                        <div className="title font-medium text-[18px] mb-[15px]">Cookie Settings</div>
                        <div className="expo text-[14px] sm:text-[12px] text-white/50">On this website, we use cookies and similar functions to process device information and personal data. Processing serves the integration of content, external services, and third-party elements, statistical analysis/measurement, personalized advertising, and integration of social media. Depending on the function, data may be transferred to third parties and processed by them. This consent is optional, not necessary for the use of our website, and can be revoked at any time using the icon at the bottom left.</div>
                    </div>
                    <div className="split my-[20px] sm:my-[10px] bg-white/5 w-full h-[1px]"></div>
                    <div className="action-field flex items-center justify-between gap-[20px] sm:flex-col">
                        <button className="accept-cookie close-cookie button group/button w-full flex justify-center items-center gap-[20px] bg-primary px-[20px] hover:bg-secondary h-[45px] md:h-[50px] duration-350">
                            <div className="text text-[13px] text-white font-medium relative z-2 whitespace-nowrap duration-350">Accept Cookies</div>
                        </button>
                        <button className="close-cookie button group/button w-full flex justify-center items-center gap-[20px] bg-transparent px-[20px] h-[45px] md:h-[50px] duration-350 border border-solid border-primary">
                            <div className="text text-[13px] text-white/50 duration-350 font-medium relative z-2 whitespace-nowrap group-hover/button:text-white">Reject</div>
                        </button>
                    </div>
                    <div className="link-field mt-[30px]">
                        <a href="https://asirgroup.com/gdpr/" className="text-white/50 duration-350 hover:text-white underline text-[13px] font-medium">GDPR</a>
                        <span className="mx-[10px] text-black/50">|</span>
                    </div>
                </div>
            </div>
            <Script 
                src="/components/contact/contact.js" 
                strategy="afterInteractive"
            />
        </>
    )
}
