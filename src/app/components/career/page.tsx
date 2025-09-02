"use client";

import React, { useState, useEffect } from 'react';
import './style.css';
import Icon from '../ui/Icon';
import { usePerformanceMonitor } from './usePerformanceMonitor';

interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  type: string;
  department?: string;
  salary?: string;
  responsibilities?: string;
  postedDate?: string;
  skills: string[];
  benefits: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
}

interface JobFilters {
  search: string;
  department: string;
  location: string;
  type: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Career() {
    // Performance monitoring
    const { trackApiCall, trackCacheHit } = usePerformanceMonitor('Career');
    
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<JobFilters>({
        search: '',
        department: '',
        location: '',
        type: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [departments, setDepartments] = useState<string[]>([]);
    const [locations, setLocations] = useState<string[]>([]);
    const [jobTypes, setJobTypes] = useState<string[]>([]);
    
    // Performance optimization states
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [jobCache, setJobCache] = useState<Map<string, any>>(new Map());
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Generate cache key for current request
    const getCacheKey = (page: number, searchFilters: JobFilters) => {
        return `${page}-${searchFilters.search}-${searchFilters.department}-${searchFilters.location}-${searchFilters.type}`;
    };

    // Fetch jobs from API with caching and request cancellation
    const fetchJobs = async () => {
        // Cancel previous request if it exists
        if (abortController) {
            abortController.abort();
        }
        
        const newController = new AbortController();
        setAbortController(newController);
        
        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10'
            });

            if (debouncedSearch) params.append('search', debouncedSearch);
            if (filters.department) params.append('department', filters.department);
            if (filters.location) params.append('location', filters.location);
            if (filters.type) params.append('type', filters.type);

            // Check cache first
            const cacheKey = getCacheKey(currentPage, { ...filters, search: debouncedSearch });
            if (jobCache.has(cacheKey)) {
                const cached = jobCache.get(cacheKey);
                setJobs(cached.data);
                setTotalPages(cached.pagination.totalPages);
                setTotalJobs(cached.pagination.total);
                setLoading(false);
                trackCacheHit(); // Track cache hit
                return;
            }

            const response = await fetch(`${BACKEND_URL}/api/career/jobs?${params}`, {
                signal: newController.signal
            });
            
            trackApiCall(); // Track API call
            
            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const data = await response.json();
            
            if (data.success) {
                setJobs(data.data);
                setTotalPages(data.pagination.totalPages);
                setTotalJobs(data.pagination.total);
                
                // Cache the result
                setJobCache(prev => new Map(prev.set(cacheKey, data)));
                
                // Extract unique values for filters
                const depts = [...new Set(data.data.map((job: Job) => job.department).filter(Boolean))] as string[];
                const locs = [...new Set(data.data.map((job: Job) => job.location).filter(Boolean))] as string[];
                const types = [...new Set(data.data.map((job: Job) => job.type).filter(Boolean))] as string[];
                
                setDepartments(depts);
                setLocations(locs);
                setJobTypes(types);
            } else {
                throw new Error(data.error || 'Failed to fetch jobs');
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                return; // Ignore cancelled requests
            }
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch job details for modal
    const fetchJobDetails = async (jobId: string) => {
        console.log('Fetching job details for ID:', jobId);
        try {
            const response = await fetch(`${BACKEND_URL}/api/career/jobs/${jobId}`);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error('Failed to fetch job details');
            }

            const data = await response.json();
            console.log('Job details data:', data);
            
            if (data.success) {
                setSelectedJob(data.data);
                setShowModal(true);
                console.log('Modal should now be open');
            } else {
                throw new Error(data.error || 'Failed to fetch job details');
            }
        } catch (err) {
            console.error('Error fetching job details:', err);
            alert('Failed to load job details');
        }
    };

    // Handle filter changes with debouncing
    const handleFilterChange = (filterType: keyof JobFilters, value: string) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Handle search with debouncing
    const handleSearch = (value: string) => {
        setFilters(prev => ({ ...prev, search: value }));
        setCurrentPage(1);
    };

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [filters.search]);

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle job application
    const handleJobApplication = async (jobId: string) => {
        setShowModal(false);
        // Navigate to application page
        window.location.href = `/career/apply?jobId=${jobId}`;
    };



    // Fetch jobs when debounced search, filters, or page changes
    useEffect(() => {
        fetchJobs();
    }, [currentPage, debouncedSearch, filters.department, filters.location, filters.type]);

    // Background slider effect
    useEffect(() => {
        const slides = document.querySelectorAll('.background-slide');
        if (slides.length > 0) {
            let currentSlide = 0;
            
            const interval = setInterval(() => {
                slides[currentSlide].classList.remove('active');
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].classList.add('active');
            }, 5000);

            return () => clearInterval(interval);
        }
    }, []);

    // Handle modal body class and keyboard events
    useEffect(() => {
        if (showModal) {
            document.body.classList.add('modal-open');
            
            // Add keyboard event listener for Escape key
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    setShowModal(false);
                }
            };
            
            document.addEventListener('keydown', handleEscape);
            
            return () => {
                document.removeEventListener('keydown', handleEscape);
            };
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [showModal]);

    return (
        <>
            {/* Hero Section */}
            <section className="hero">
                <div className="background-slider">
                    <div
                        className="background-slide active"
                        data-desktop="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        data-mobile="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    ></div>
                    <div
                        className="background-slide"
                        data-desktop="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        data-mobile="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    ></div>
                    <div
                        className="background-slide"
                        data-desktop="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        data-mobile="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    ></div>
                </div>
                <div className="hero-overlay"></div>
            </section>

            {/* Current Positions Section */}
            <section id="current-positions" className="current-positions">
                <div className="container">
                    <div className="section-header">
                        <h2>Current Positions</h2>
                        <p>
                            Explore our open positions and find the perfect role for your career
                            growth
                        </p>
                    </div>

                    {/* Job Search and Filters */}
                    <div className="job-filters">
                        <div className="search-container">
                            <div className="search-box">
                                <Icon name="icon-search" size={16} />
                                <input
                                    type="text"
                                    id="job-search"
                                    placeholder="Search jobs by title, department, or keywords..."
                                    value={filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="filter-options">
                            <select 
                                id="department-filter"
                                value={filters.department}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                            <select 
                                id="location-filter"
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                            >
                                <option value="">All Locations</option>
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                            <select 
                                id="type-filter"
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                            >
                                <option value="">All Types</option>
                                {jobTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Job Listings */}
                    <div className="job-listings">
                        {error && (
                            <div className="error-message">
                                <Icon name="icon-alert" size={16} />
                                <p>{error}</p>
                            </div>
                        )}

                        {loading ? (
                            <div className="loading-state">
                                <div className="jobs-grid">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="job-card skeleton">
                                            <div className="skeleton-title"></div>
                                            <div className="skeleton-meta">
                                                <div className="skeleton-badge"></div>
                                                <div className="skeleton-badge"></div>
                                            </div>
                                            <div className="skeleton-description"></div>
                                            <div className="skeleton-button"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="no-results">
                                <Icon name="icon-search" size={16} />
                                <h3>No jobs found</h3>
                                <p>Try adjusting your search criteria or filters</p>
                            </div>
                        ) : (
                            <div id="jobs-container" className="jobs-grid">
                                {jobs.map((job) => (
                                    <div key={job.id} className="job-card">
                                        <div className="job-card-header">
                                            <h3 className="job-title">{job.title}</h3>
                                            <div className="job-meta">
                                                {job.location && (
                                                    <span className="meta-badge location">
                                                        <Icon name="icon-location" size={16} />
                                                        <span>{job.location}</span>
                                                    </span>
                                                )}
                                                <span className="meta-badge type">
                                                    <Icon name="icon-briefcase" size={16} />
                                                    <span>{job.type}</span>
                                                </span>
                                                {job.department && (
                                                    <span className="meta-badge department">
                                                        <Icon name="icon-building" size={16} />
                                                        <span>{job.department}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="job-card-body">
                                            <p className="job-description">
                                                {job.description.length > 150 
                                                    ? `${job.description.substring(0, 150)}...` 
                                                    : job.description
                                                }
                                            </p>
                                            {job.salary && (
                                                <div className="job-salary">
                                                    <Icon name="icon-currency-dollar" size={16} />
                                                    <span>{job.salary}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="job-card-footer">
                                            <button 
                                                className="btn btn-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    fetchJobDetails(job.id);
                                                }}
                                            >
                                                <Icon name="icon-eye" size={16} />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <div className="pagination-info">
                                    <span id="pagination-info">
                                        Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalJobs)} of {totalJobs} jobs
                                    </span>
                                </div>
                                <div className="pagination-controls">
                                    <button 
                                        className="pagination-btn" 
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        <Icon name="icon-chevron-left" size={16} />
                                        Previous
                                    </button>
                                    <div id="page-numbers" className="page-numbers">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                className={`page-number ${page === currentPage ? 'active' : ''}`}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        className="pagination-btn" 
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                        Next
                                        <Icon name="icon-chevron-right" size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>



            {/* Job Details Modal */}
            {showModal && selectedJob && (
                <div id="job-modal" className="modal no-animation" style={{ display: 'block' }}>
                    <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
                    <div className="modal-container">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-header-content">
                                    <h2 className="modal-title">{selectedJob.title}</h2>
                                    <div className="modal-meta">
                                        {selectedJob.location && (
                                            <span className="meta-badge location">
                                                <Icon name="icon-location" size={16} />
                                                <span>{selectedJob.location}</span>
                                            </span>
                                        )}
                                        <span className="meta-badge type">
                                            <Icon name="icon-briefcase" size={16} />
                                            <span>{selectedJob.type}</span>
                                        </span>
                                        {selectedJob.department && (
                                            <span className="meta-badge department">
                                                <Icon name="icon-building" size={16} />
                                                <span>{selectedJob.department}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    className="modal-close" 
                                    aria-label="Close modal"
                                    onClick={() => setShowModal(false)}
                                >
                                    <Icon name="icon-cross" size={16} />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="modal-sections">
                                    <div className="modal-section">
                                        <h3 className="section-title">
                                            <Icon name="icon-info" size={16} />
                                            Job Overview
                                        </h3>
                                        <div className="section-content" id="modal-job-description">
                                            {selectedJob.description}
                                        </div>
                                    </div>

                                    {selectedJob.requirements && (
                                        <div className="modal-section">
                                            <h3 className="section-title">
                                                <Icon name="icon-list-check" size={16} />
                                                Requirements
                                            </h3>
                                            <div className="section-content" id="modal-job-requirements">
                                                {selectedJob.requirements}
                                            </div>
                                        </div>
                                    )}

                                    {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                                        <div className="modal-section">
                                            <h3 className="section-title">
                                                <Icon name="icon-star" size={16} />
                                                Benefits
                                            </h3>
                                            <div className="section-content" id="modal-job-benefits">
                                                <ul>
                                                    {selectedJob.benefits.map((benefit, index) => (
                                                        <li key={index}>{benefit}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    <div className="modal-section">
                                        <h3 className="section-title">
                                            <Icon name="icon-calendar" size={16} />
                                            Job Details
                                        </h3>
                                        <div className="job-details-grid" id="modal-job-details">
                                            {selectedJob.salary && (
                                                <div className="detail-item">
                                                    <span className="detail-label">Salary:</span>
                                                    <span className="detail-value">{selectedJob.salary}</span>
                                                </div>
                                            )}
                                            {selectedJob.postedDate && (
                                                <div className="detail-item">
                                                    <span className="detail-label">Posted:</span>
                                                    <span className="detail-value">
                                                        {new Date(selectedJob.postedDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedJob.skills && selectedJob.skills.length > 0 && (
                                                <div className="detail-item">
                                                    <span className="detail-label">Skills:</span>
                                                    <span className="detail-value">
                                                        {selectedJob.skills.join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <div className="modal-actions">
                                    <button 
                                        className="btn btn-secondary modal-close-btn"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <Icon name="icon-cross" size={16} />
                                        Close
                                    </button>
                                    <button 
                                        className="btn btn-primary apply-btn"
                                        onClick={() => handleJobApplication(selectedJob.id)}
                                    >
                                        <Icon name="icon-send" size={16} />
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
