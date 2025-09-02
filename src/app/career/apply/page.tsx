"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import Icon from '../../components/ui/Icon';
import '../../components/career/style.css';

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
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function CareerApplyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('jobId');
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) {
        setError('No job ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/proxy/career/jobs/${jobId}`, { credentials: 'include' });
        const data = await response.json();
        
        if (data.success) {
          setJob(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch job details');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    if (jobId) {
      formData.append('jobId', jobId);
    }

    // Client-side file constraints (mirror backend expectations)
    const file = formData.get('resume') as File | null;
    if (!file) {
      alert('Please attach your resume.');
      setSubmitting(false);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Resume must be 5MB or smaller.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/proxy/career/applications`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const text = await response.text();
      let result: any = {};
      try { result = JSON.parse(text); } catch { result = { success: false, error: text }; }

      if (response.ok && result.success) {
        const jobTitle = job?.title || 'the position';
        alert(`Application submitted successfully for ${jobTitle}! We will contact you soon.`);
        router.push('/career');
      } else {
        const msg = result?.error || result?.message || `Failed to submit application (status ${response.status}).`;
        alert(msg);
      }
    } catch (err) {
      alert('Network error while submitting your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
    
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading job details...</p>
        </div>
    
      </>
    );
  }

  if (error || !job) {
    return (
      <>
   
        <div className="error-container">
          <h2>Error Loading Job</h2>
          <p>{error || 'Job not found'}</p>
          <button 
            className="btn btn-primary"
            onClick={() => router.push('/career')}
          >
            Back to Careers
          </button>
        </div>
      
      </>
    );
  }

  return (
    <>
   
      
      <div className="application-page">
        <div className="container">
          <div className="job-summary">
            <div className="job-summary-header">
              <h1>Apply for {job.title}</h1>
              <button 
                className="btn btn-secondary"
                onClick={() => router.push('/career')}
              >
                Back to All Jobs
              </button>
            </div>
            
            <div className="job-summary-content">
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
              
              <div className="job-description">
                <h3>Job Description</h3>
                <p>{job.description}</p>
              </div>
            </div>
          </div>

          <div className="application-form-section">
            <div className="section-header">
              <h2>Submit Your Application</h2>
              <p>Please fill out the form below to apply for this position.</p>
            </div>
            
            <form className="application-form" onSubmit={handleFormSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input type="text" id="name" name="name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input type="email" id="email" name="email" required />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" />
                </div>
                <div className="form-group">
                  <label htmlFor="position">Position Applied For</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={job.title}
                    readOnly
                    className="readonly"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Cover Letter *</label>
                <textarea
                  id="message"
                  name="message"
                  rows={8}
                  placeholder="Tell us about yourself and why you'd like to join our team..."
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="resume">Resume/CV *</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    required
                  />
                  <div className="file-upload-content">
                    <Icon name="icon-cloud-upload" size={24} />
                    <span>Choose file or drag and drop</span>
                    <small>PDF, DOC, or DOCX (Max 5MB)</small>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => router.push('/career')}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      

    </>
  );
}

export default function CareerApply() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CareerApplyContent />
    </Suspense>
  );
}

