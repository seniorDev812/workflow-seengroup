﻿
"use client";

import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Tabs,
  Card,
  Text,
  Badge,
  Group,
  Button,
  Modal,
  Stack,
  Grid,
  ActionIcon,
  Tooltip,
  Alert,
  LoadingOverlay,
  Pagination,
  Box,
  Divider,
  Paper,
  ThemeIcon,
  SimpleGrid,
  ScrollArea,
  Table,
  Avatar,
  Menu,
  Switch,
  TextInput,
  Select,
  Textarea,
  Chip
} from '@mantine/core';

import {
  IconBriefcase,
  IconUsers,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconDownload,
  IconMail,
  IconPhone,
  IconCalendar,
  IconMapPin,
  IconBuilding,
  IconClock,
  IconCurrencyDollar,
  IconFileText,
  IconCheck,
  IconX,
  IconSearch,
  IconFilter,
  IconRefresh,
  IconUserCheck,
  IconUserX,
  IconFileDescription,
  IconStar
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAdminPerformance } from '../../hooks/useAdminPerformance';

// Add client-side only rendering to prevent hydration issues
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
};

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
  skills?: string[];
  benefits?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  applicationsCount?: number;
}

interface Application {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
}

export default function CareerManagement() {
  // Performance monitoring
  const { trackApiCall, trackUserAction, trackError } = useAdminPerformance('Career Management');
  
  const [activeTab, setActiveTab] = useState<string | null>('jobs');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Advanced filtering state
  const [jobFilters, setJobFilters] = useState({
    search: '',
    type: '',
    department: '',
    location: '',
    status: 'active',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [jobPagination, setJobPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  // Job modal state
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  // Read-only job details modal state
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [viewJob, setViewJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    department: '',
    salary: '',
    responsibilities: '',
    postedDate: '',
    skills: [] as string[],
    benefits: [] as string[],
    type: 'FULL_TIME',
    isActive: true
  });

  // Application modal state
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Confirmation modals state
  const [jobConfirmOpen, setJobConfirmOpen] = useState(false);
  const [applicationConfirmOpen, setApplicationConfirmOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Form validation state
  const [formValidation, setFormValidation] = useState<Record<string, string>>({});
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Load jobs with advanced filtering
  const loadJobs = async (filters = jobFilters, page = 1) => {
    setJobsLoading(true);
    try {
      const startTime = performance.now();
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: jobPagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.department && { department: filters.department }),
        ...(filters.location && { location: filters.location }),
        ...(filters.status && { status: filters.status }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder })
      });

      const response = await fetch(`/api/admin/proxy/career/jobs?${params}`, {
        credentials: 'include',
      });
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Track API call performance
      trackApiCall(false, loadTime);
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data || []);
        setJobPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
        setCurrentPage(page);
      } else {
        trackError('load_jobs', 'Failed to load jobs');
        notifications.show({
          title: 'Error',
          message: 'Failed to load jobs',
          color: 'red',
        });
      }
    } catch (error) {
      trackError('load_jobs', 'Network error loading jobs');
      notifications.show({
        title: 'Error',
        message: 'Network error loading jobs',
        color: 'red',
      });
    } finally {
      setJobsLoading(false);
    }
  };

  // Load applications
  const loadApplications = async () => {
    setApplicationsLoading(true);
    try {
      const response = await fetch(`/api/proxy/career/applications`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.data || []);
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to load applications',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Network error loading applications',
        color: 'red',
      });
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Download resume function
  const downloadResume = async (applicationId: string, applicantName: string) => {
    try {

      const response = await fetch(`/api/proxy/career/applications/${applicationId}/resume`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Download error:', response.status, errorData);
        throw new Error(`Download failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${applicantName}_resume.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      notifications.show({
        title: 'Success',
        message: 'Resume downloaded successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Download error:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to download resume',
        color: 'red',
      });
    }
  };

  // Bulk operations
  const handleBulkAction = async () => {
    if (!selectedApplications.length || !bulkAction) return;

    try {
      const response = await fetch(`/api/proxy/career/applications/bulk`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationIds: selectedApplications,
          action: bulkAction,
        }),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: `Bulk ${bulkAction} completed successfully`,
          color: 'green',
        });
        setSelectedApplications([]);
        setBulkAction('');
        setShowBulkModal(false);
        loadApplications();
      } else {
        throw new Error('Failed to perform bulk action');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to perform bulk action',
        color: 'red',
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(applications.map(app => app.id));
    } else {
      setSelectedApplications([]);
    }
  };

  const handleSelectApplication = (applicationId: string, checked: boolean) => {
    if (checked) {
      setSelectedApplications(prev => [...prev, applicationId]);
    } else {
      setSelectedApplications(prev => prev.filter(id => id !== applicationId));
    }
  };

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setJobFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFilterSubmit = () => {
    setJobPagination(prev => ({ ...prev, page: 1 }));
    loadJobs(jobFilters, 1);
  };

  const handleFilterReset = () => {
    const defaultFilters = {
      search: '',
      type: '',
      department: '',
      location: '',
      status: 'active',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setJobFilters(defaultFilters);
    setJobPagination(prev => ({ ...prev, page: 1 }));
    loadJobs(defaultFilters, 1);
  };

  // Filtered jobs (now handled by backend)
  const filteredJobs = jobs; // Backend handles filtering
  const paginatedJobs = jobs; // Backend handles pagination
  const totalJobPages = jobPagination.totalPages;

  // Filtered applications
  const filteredApplications = applications.filter(app => {
    const matchesText = (
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.job && app.job.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const matchesStatus = (
      filterStatus === 'all' ||
      (filterStatus === 'pending' && app.status.toUpperCase() === 'PENDING') ||
      (filterStatus === 'reviewed' && app.status.toUpperCase() === 'REVIEWING') ||
      (filterStatus === 'shortlisted' && app.status.toUpperCase() === 'REVIEWING') ||
      (filterStatus === 'rejected' && app.status.toUpperCase() === 'REJECTED') ||
      (filterStatus === 'hired' && app.status.toUpperCase() === 'HIRED')
    );
    return matchesText && matchesStatus;
  });

  const paginatedApplications = filteredApplications.slice((applicationsPage - 1) * pageSize, applicationsPage * pageSize);
  const totalApplicationPages = Math.ceil(filteredApplications.length / pageSize);

  // Job operations
  const openCreateJob = () => {
    setEditingJob(null);
    setJobForm({
      title: '',
      description: '',
      requirements: '',
      location: '',
      department: '',
      salary: '',
      responsibilities: '',
      postedDate: '',
      skills: [],
      benefits: [],
      type: 'FULL_TIME',
      isActive: true
    });
    setJobModalOpen(true);
  };

  const openEditJob = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      description: job.description,
      requirements: job.requirements || '',
      location: job.location || '',
      department: job.department || '',
      salary: job.salary || '',
      responsibilities: job.responsibilities || '',
      postedDate: job.postedDate ? new Date(job.postedDate).toISOString().slice(0, 10) : '',
      skills: job.skills || [],
      benefits: job.benefits || [],
      type: job.type,
      isActive: job.isActive
    });
    setJobModalOpen(true);
  };

  const openJobDetails = (job: Job) => {
    setViewJob(job);
    setJobDetailsOpen(true);
  };

  const saveJob = async () => {
    // Enhanced validation
    if (!jobForm.title.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Job title is required',
        color: 'red',
      });
      return;
    }

    if (!jobForm.description.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Job description is required',
        color: 'red',
      });
      return;
    }

    if (!jobForm.type) {
      notifications.show({
        title: 'Validation Error',
        message: 'Job type is required',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const startTime = performance.now();
      
      const url = editingJob 
        ? `/api/admin/proxy/career/jobs` 
        : `/api/admin/proxy/career/jobs`;
      const method = editingJob ? 'PUT' : 'POST';
      
      // Prepare job data with proper formatting
      const jobData = {
        ...jobForm,
        title: jobForm.title.trim(),
        description: jobForm.description.trim(),
        requirements: jobForm.requirements?.trim() || null,
        location: jobForm.location?.trim() || null,
        department: jobForm.department?.trim() || null,
        salary: jobForm.salary?.trim() || null,
        responsibilities: jobForm.responsibilities?.trim() || null,
        postedDate: jobForm.postedDate || null,
        skills: jobForm.skills.filter(skill => skill.trim()),
        benefits: jobForm.benefits.filter(benefit => benefit.trim()),
        ...(editingJob && { id: editingJob.id })
      };

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      const endTime = performance.now();
      const saveTime = endTime - startTime;

      if (response.ok) {
        const result = await response.json();
        trackUserAction(editingJob ? 'edit_job' : 'create_job', true, saveTime);
        notifications.show({
          title: 'Success',
          message: result.message || `Job ${editingJob ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        setJobModalOpen(false);
        await loadJobs();
      } else {
        const errorData = await response.json();
        trackError('save_job', errorData.error || 'Failed to save job');
        
        // Handle validation errors from backend
        if (errorData.details && Array.isArray(errorData.details)) {
          const validationErrors = errorData.details.map((detail: any) => detail.msg).join(', ');
          notifications.show({
            title: 'Validation Error',
            message: validationErrors,
            color: 'red',
          });
        } else {
          notifications.show({
            title: 'Error',
            message: errorData.error || 'Failed to save job',
            color: 'red',
          });
        }
      }
    } catch (error) {
      trackError('save_job', 'Network error saving job');
      notifications.show({
        title: 'Error',
        message: 'Network error saving job. Please check your connection and try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const openJobDeleteConfirm = (job: Job) => {
    setJobToDelete(job);
    setJobConfirmOpen(true);
  };

  const deleteJob = async (jobId: string) => {
    setLoading(true);
    try {
      const startTime = performance.now();
      
      const response = await fetch(`/api/admin/proxy/career/jobs?id=${jobId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const endTime = performance.now();
      const deleteTime = endTime - startTime;

      if (response.ok) {
        trackUserAction('archive_job', true, deleteTime);
        notifications.show({
          title: 'Success',
          message: 'Job archived successfully',
          color: 'green',
        });
        await loadJobs();
      } else {
        const errorData = await response.json();
        trackError('archive_job', errorData.error || 'Failed to archive job');
        notifications.show({
          title: 'Error',
          message: errorData.error || 'Failed to archive job',
          color: 'red',
        });
      }
    } catch (error) {
      trackError('archive_job', 'Network error archiving job');
      notifications.show({
        title: 'Error',
        message: 'Network error archiving job',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Application operations
  const openApplicationDetails = (application: Application) => {
    setSelectedApplication(application);
    setApplicationModalOpen(true);
  };

  const updateApplicationStatus = async (applicationId: string, uiStatus: string) => {
    setLoading(true);
    try {
      const apiStatusMap: Record<string, string> = {
        pending: 'PENDING',
        reviewed: 'REVIEWING',
        shortlisted: 'REVIEWING',
        approved: 'APPROVED',
        rejected: 'REJECTED',
        hired: 'HIRED',
      };
      const status = apiStatusMap[uiStatus.toLowerCase()] || 'PENDING';
      const response = await fetch(`/api/proxy/career/applications/${applicationId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

        if (response.ok) {
          notifications.show({
          title: 'Success',
          message: 'Application status updated successfully',
          color: 'green',
        });
        await loadApplications();
      } else {
        const errorData = await response.json();
          notifications.show({
          title: 'Error',
          message: errorData.error || 'Failed to update application status',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Network error updating application status',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const openApplicationDeleteConfirm = (application: Application) => {
    setApplicationToDelete(application);
    setApplicationConfirmOpen(true);
  };

  const deleteApplication = async (applicationId: string) => {

    setLoading(true);
    try {
      const response = await fetch(`/api/proxy/career/applications/${applicationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: 'Application deleted successfully',
          color: 'green',
        });
        await loadApplications();
      } else {
        const errorData = await response.json();
        notifications.show({
          title: 'Error',
          message: errorData.error || 'Failed to delete application',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Network error deleting application',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadJobs(), loadApplications()]);
      notifications.show({
        title: 'Success',
        message: 'Data refreshed successfully',
        color: 'green',
      });
    } finally {
      setLoading(false);
    }
  };

  // Quick email via default mail client
  const sendEmailToApplicant = (app: Application) => {
    if (!app?.email) return;
    const subject = encodeURIComponent(`Regarding your application for ${app.job?.title || 'the position'}`);
    const body = encodeURIComponent(`Hi ${app.name},\n\nThank you for your application for ${app.job?.title || 'the position'}.\n\nBest regards,\nSeen Group HR`);
    window.location.href = `mailto:${app.email}?subject=${subject}&body=${body}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'yellow';
      case 'reviewing': return 'blue';
      case 'shortlisted': return 'orange';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'hired': return 'green';
      default: return 'gray';
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return 'blue';
      case 'PART_TIME': return 'green';
      case 'CONTRACT': return 'orange';
      case 'INTERNSHIP': return 'purple';
      case 'FREELANCE': return 'cyan';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <IconClock size={16} />;
      case 'reviewed': return <IconEye size={16} />;
      case 'shortlisted': return <IconStar size={16} />;
      case 'rejected': return <IconX size={16} />;
      case 'hired': return <IconCheck size={16} />;
      default: return <IconFileText size={16} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl" c="white">
        <IconBriefcase size={32} style={{ marginRight: 12 }} />
        Career Management
      </Title>

      {/* Statistics Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
        <Card withBorder p="md" bg="dark.6">
          <Group>
            <ThemeIcon size="lg" variant="light" color="blue">
              <IconBriefcase size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Total Jobs</Text>
              <Text fw={700} size="lg">{jobs.length}</Text>
            </div>
          </Group>
        </Card>

        <Card withBorder p="md" bg="dark.6">
          <Group>
            <ThemeIcon size="lg" variant="light" color="green">
              <IconUserCheck size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Active Jobs</Text>
              <Text fw={700} size="lg">{jobs.filter(job => job.isActive).length}</Text>
            </div>
          </Group>
        </Card>

        <Card withBorder p="md" bg="dark.6">
          <Group>
            <ThemeIcon size="lg" variant="light" color="yellow">
              <IconUsers size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Total Applications</Text>
              <Text fw={700} size="lg">{applications.length}</Text>
            </div>
          </Group>
        </Card>

        <Card withBorder p="md" bg="dark.6">
          <Group>
            <ThemeIcon size="lg" variant="light" color="orange">
              <IconClock size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Pending Review</Text>
              <Text fw={700} size="lg">{applications.filter(app => app.status === 'pending').length}</Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      <Tabs value={activeTab} onChange={setActiveTab} variant="pills" color="brand">
        <Tabs.List mb="xl">
          <Tabs.Tab value="jobs" leftSection={<IconBriefcase size={16} />}>
            Job Listings ({jobPagination.total})
          </Tabs.Tab>
          <Tabs.Tab value="applications" leftSection={<IconUsers size={16} />}>
            Applications ({applications.length})
          </Tabs.Tab>

        </Tabs.List>

        <Tabs.Panel value="jobs">
          <Card withBorder p="md" bg="dark.6">
            <Group justify="space-between" mb="md">
              <Title order={3} c="white">Job Listings</Title>
              <Button 
                leftSection={<IconPlus size={16} />} 
                color="brand"
                onClick={openCreateJob}
              >
                Add New Job
              </Button>
            </Group>

            {/* Advanced Filters */}
            <Card withBorder p="md" mb="md" bg="dark.5">
              <Text size="sm" fw={500} mb="md" c="white">Advanced Filters</Text>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
                <TextInput
                  placeholder="Search jobs..."
                  leftSection={<IconSearch size={16} />}
                  value={jobFilters.search}
                  onChange={(e) => handleFilterChange('search', e.currentTarget.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilterSubmit()}
                />
                <Select
                  placeholder="Job Type"
                  data={[
                    { value: '', label: 'All Types' },
                    { value: 'FULL_TIME', label: 'Full Time' },
                    { value: 'PART_TIME', label: 'Part Time' },
                    { value: 'CONTRACT', label: 'Contract' },
                    { value: 'INTERNSHIP', label: 'Internship' },
                    { value: 'FREELANCE', label: 'Freelance' }
                  ]}
                  value={jobFilters.type}
                  onChange={(value) => handleFilterChange('type', value || '')}
                />
                <Select
                  placeholder="Department"
                  data={[
                    { value: '', label: 'All Departments' },
                    { value: 'Engineering', label: 'Engineering' },
                    { value: 'Marketing', label: 'Marketing' },
                    { value: 'Sales', label: 'Sales' },
                    { value: 'Design', label: 'Design' },
                    { value: 'Product', label: 'Product' },
                    { value: 'Operations', label: 'Operations' }
                  ]}
                  value={jobFilters.department}
                  onChange={(value) => handleFilterChange('department', value || '')}
                />
                <Select
                  placeholder="Status"
                  data={[
                    { value: 'active', label: 'Active Only' },
                    { value: 'archived', label: 'Archived Only' },
                    { value: 'all', label: 'All Jobs' }
                  ]}
                  value={jobFilters.status}
                  onChange={(value) => handleFilterChange('status', value || 'active')}
                />
              </SimpleGrid>
              
              <Group justify="space-between" mt="md">
                <Group>
                  <Select
                    placeholder="Sort by"
                    data={[
                      { value: 'createdAt', label: 'Date Created' },
                      { value: 'title', label: 'Job Title' },
                      { value: 'applications', label: 'Applications' },
                      { value: 'postedDate', label: 'Posted Date' }
                    ]}
                    value={jobFilters.sortBy}
                    onChange={(value) => handleFilterChange('sortBy', value || 'createdAt')}
                    w={150}
                  />
                  <Select
                    placeholder="Order"
                    data={[
                      { value: 'desc', label: 'Descending' },
                      { value: 'asc', label: 'Ascending' }
                    ]}
                    value={jobFilters.sortBy}
                    onChange={(value) => handleFilterChange('sortOrder', value || 'desc')}
                    w={120}
                  />
                </Group>
                <Group>
                  <Button variant="light" onClick={handleFilterReset}>
                    Reset Filters
                  </Button>
                  <Button onClick={handleFilterSubmit}>
                    Apply Filters
                  </Button>
                </Group>
              </Group>
            </Card>

            <ClientOnly>
              <Grid>
                {paginatedJobs.map((job) => (
                <Grid.Col key={job.id} span={{ base: 12, md: 6, lg: 4 }}>
                  <Card withBorder p="md" bg="dark.5">
                    <Group justify="space-between" mb="xs">
                      <Badge color={job.isActive ? 'green' : 'red'} variant="light">
                        {job.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Menu>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item 
                            leftSection={<IconEye size={16} />}
                            onClick={() => openJobDetails(job)}
                          >
                            View Details
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IconEdit size={16} />}
                            onClick={() => openEditJob(job)}
                          >
                            Edit Job
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IconTrash size={16} />}
                            color="red"
                            onClick={() => openJobDeleteConfirm(job)}
                          >
                            Archive Job
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>

                    <Title order={4} mb="xs" c="white">{job.title}</Title>
                    
                    <Group gap="xs" mb="xs">
                      <Badge variant="light" size="sm">
                        <IconBuilding size={12} style={{ marginRight: 4 }} />
                        {job.department || 'â€”'}
                      </Badge>
                      <Badge variant="light" size="sm">
                        <IconMapPin size={12} style={{ marginRight: 4 }} />
                        {job.location}
                      </Badge>
                    </Group>

                    <Group gap="xs" mb="md">
                      <Badge variant="light" size="sm">
                        <IconClock size={12} style={{ marginRight: 4 }} />
                        {job.type}
                      </Badge>
                      <Badge variant="light" size="sm">
                        <IconCurrencyDollar size={12} style={{ marginRight: 4 }} />
                        {job.salary || 'â€”'}
                      </Badge>
                    </Group>

                    <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
                      {job.description}
                    </Text>

                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        {job.applicationsCount || 0} applications
                      </Text>
                      <Switch
                        checked={job.isActive}
                        onChange={() => { /* handleJobToggle(job.id); */ }}
                        size="sm"
                      />
                    </Group>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
            </ClientOnly>

            {filteredJobs.length === 0 && (
              <Alert icon={<IconSearch size={16} />} title="No jobs found" color="blue" mt="md">
                No jobs match your search criteria. Try adjusting your filters.
              </Alert>
            )}

            {filteredJobs.length > 0 && (
              <Group justify="space-between" mt="xl">
                <Text size="sm" c="dimmed">
                  Showing {((currentPage - 1) * jobPagination.limit) + 1} to {Math.min(currentPage * jobPagination.limit, jobPagination.total)} of {jobPagination.total} jobs
                </Text>
                <Pagination
                  total={totalJobPages}
                  value={currentPage}
                  onChange={(page) => loadJobs(jobFilters, page)}
                  color="brand"
                />
              </Group>
            )}
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="applications">
          <Card withBorder p="md" bg="dark.6">
            <Group justify="space-between" mb="md">
              <Title order={3} c="white">Applications</Title>
              <Group>
                <TextInput
                  placeholder="Search applications..."
                  leftSection={<IconSearch size={16} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.currentTarget.value)}
                  w={250}
                />
                <Select
                  placeholder="Filter by status"
                  data={[
                    { value: 'all', label: 'All Status' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'reviewed', label: 'Reviewed' },
                    { value: 'shortlisted', label: 'Shortlisted' },
                    { value: 'rejected', label: 'Rejected' },
                    { value: 'hired', label: 'Hired' }
                  ]}
                  value={filterStatus}
                  onChange={(value) => setFilterStatus(value || 'all')}
                  w={180}
                />
                <Button variant="light" color="brand" leftSection={<IconRefresh size={16} />} onClick={refreshData}>
                  Refresh
                </Button>
              </Group>
            </Group>

            <ScrollArea>
              <ClientOnly>
                <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Applicant</Table.Th>
                    <Table.Th>Position</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Resume</Table.Th>
                    <Table.Th>Submitted</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedApplications.map((application) => (
                    <Table.Tr key={application.id}>
                      <Table.Td>
                        <Group>
                          <Avatar size="sm" color="blue">
                            {application.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <div>
                            <Text fw={500} size="sm">{application.name}</Text>
                            <Text size="xs" c="dimmed">{application.email}</Text>
                            {application.phone && (
                              <Text size="xs" c="dimmed">{application.phone}</Text>
                            )}
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{application.job?.title}</Text>
                        {/* {application.jobTitle && (
                          <Text size="xs" c="dimmed">for {application.jobTitle}</Text>
                        )} */}
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          color={getStatusColor(application.status)}
                          leftSection={getStatusIcon(application.status)}
                        >
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <IconFileText size={16} />
                          <div>
                            <Text size="sm">
                              {application.resumeUrl ? 
                                `${application.name}_resume.pdf` : 
                                'N/A'
                              }
                            </Text>
                            <Text size="xs" c="dimmed">
                              {application.resumeUrl ? 'Click download to get file' : 'No resume uploaded'}
                            </Text>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{formatDate(application.createdAt)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Tooltip label="View Details">
                            <ActionIcon 
                              variant="light" 
                              color="brand"
                              onClick={() => openApplicationDetails(application)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Download Resume">
                            <ActionIcon 
                              variant="light" 
                              color="green"
                              onClick={() => downloadResume(application.id, application.name)}
                            >
                              <IconDownload size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Menu>
                            <Menu.Target>
                              <ActionIcon variant="light" color="gray">
                                <IconEdit size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Label>Change Status</Menu.Label>
                              <Menu.Item 
                                leftSection={<IconClock size={16} />}
                                onClick={() => updateApplicationStatus(application.id, 'pending')}
                              >
                                Mark as Pending
                              </Menu.Item>
                              <Menu.Item 
                                leftSection={<IconEye size={16} />}
                                onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                              >
                                Mark as Reviewed
                              </Menu.Item>
                              <Menu.Item 
                                leftSection={<IconStar size={16} />}
                                onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                              >
                                Shortlist
                              </Menu.Item>
                              <Menu.Item 
                                leftSection={<IconCheck size={16} />}
                                onClick={() => updateApplicationStatus(application.id, 'approved')}
                              >
                                Mark as Hired
                              </Menu.Item>
                              <Menu.Item 
                                leftSection={<IconX size={16} />}
                                color="red"
                                onClick={() => updateApplicationStatus(application.id, 'rejected')}
                              >
                                Reject
                              </Menu.Item>
                              <Menu.Item 
                                leftSection={<IconTrash size={16} />}
                                color="red"
                                onClick={() => openApplicationDeleteConfirm(application)}
                              >
                                Delete Application
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              </ClientOnly>
            </ScrollArea>

            {filteredApplications.length === 0 && (
              <Alert icon={<IconSearch size={16} />} title="No applications found" color="blue" mt="md">
                No applications match your search criteria. Try adjusting your filters.
              </Alert>
            )}

            {filteredApplications.length > 0 && (
              <Group justify="center" mt="xl">
                <Pagination
                  total={totalApplicationPages}
                  value={applicationsPage}
                  onChange={setApplicationsPage}
                  color="brand"
                />
              </Group>
            )}
          </Card>
        </Tabs.Panel>
        

      </Tabs>

      {/* Application Details Modal */}
      <Modal
        opened={applicationModalOpen}
        onClose={() => setApplicationModalOpen(false)}
        title="Application Details"
        size="lg"
        centered
      >
        {selectedApplication && (
          <Stack>
            <Group>
              <Avatar size="lg" color="blue">
                {selectedApplication.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <div>
                <Title order={3}>{selectedApplication.name}</Title>
                <Text c="dimmed">{selectedApplication.email}</Text>
                {selectedApplication.phone && (
                  <Text c="dimmed">{selectedApplication.phone}</Text>
                )}
              </div>
            </Group>

            <Divider />

            <Group>
              <Badge color={getStatusColor(selectedApplication.status)}>
                {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
              </Badge>
              <Text size="sm">Applied for: {selectedApplication.job?.title}</Text>
            </Group>

            {selectedApplication.coverLetter && (
              <>
                <Divider />
                <div>
                  <Text fw={500} mb="xs">Cover Letter</Text>
                  <Text size="sm">{selectedApplication.coverLetter}</Text>
                </div>
              </>
            )}

            <Divider />

            <Group>
              <Button 
                leftSection={<IconDownload size={16} />} 
                variant="light"
                onClick={() => downloadResume(selectedApplication.id, selectedApplication.name)}
              >
                Download Resume
              </Button>
              <Button leftSection={<IconMail size={16} />} color="blue" onClick={() => sendEmailToApplicant(selectedApplication)}>
                Send Email
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Read-only Job Details Modal */}
      <Modal
        opened={jobDetailsOpen}
        onClose={() => setJobDetailsOpen(false)}
        title="Job Details"
        size="lg"
        centered
      >
        {viewJob && (
          <Stack>
            <Title order={3}>{viewJob.title}</Title>
            <Group>
              {viewJob.department && (
                <Badge>{viewJob.department}</Badge>
              )}
              {viewJob.location && (
                <Badge>{viewJob.location}</Badge>
              )}
              <Badge>{viewJob.type}</Badge>
              {viewJob.salary && (
                <Badge>{viewJob.salary}</Badge>
              )}
            </Group>
            <Divider />
            <Text fw={500}>Description</Text>
            <Text size="sm" c="dimmed">{viewJob.description}</Text>
            {viewJob.requirements && (
              <>
                <Divider />
                <Text fw={500}>Requirements</Text>
                <Text size="sm" c="dimmed">{viewJob.requirements}</Text>
              </>
            )}
            {viewJob.responsibilities && (
              <>
                <Divider />
                <Text fw={500}>Responsibilities</Text>
                <Text size="sm" c="dimmed">{viewJob.responsibilities}</Text>
              </>
            )}
            {viewJob.skills && viewJob.skills.length > 0 && (
              <>
                <Divider />
                <Text fw={500}>Skills</Text>
                <Text size="sm" c="dimmed">{viewJob.skills.join(', ')}</Text>
              </>
            )}
            {viewJob.benefits && viewJob.benefits.length > 0 && (
              <>
                <Divider />
                <Text fw={500}>Benefits</Text>
                <Text size="sm" c="dimmed">{viewJob.benefits.join(', ')}</Text>
              </>
            )}
          </Stack>
        )}
      </Modal>

      {/* Job Form Modal */}
      <Modal
        opened={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        title={
          <Group>
            <IconBriefcase size={20} />
            <Text fw={600}>{editingJob ? "Edit Job" : "Add New Job"}</Text>
          </Group>
        }
        size="xl"
        centered
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Stack gap="lg">
          {/* Basic Information Section */}
          <Paper withBorder p="md">
            <Group mb="md">
              <IconFileText size={18} />
              <Text fw={600} size="sm" tt="uppercase" c="dimmed">Basic Information</Text>
            </Group>
            
            <Grid>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <TextInput
                  label="Job Title"
                  placeholder="e.g., Senior Software Engineer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  error={!jobForm.title.trim() && "Job title is required"}
                  leftSection={<IconBriefcase size={16} />}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  label="Job Type"
                  placeholder="Select job type"
                  data={[
                    { value: "FULL_TIME", label: "Full Time" },
                    { value: "PART_TIME", label: "Part Time" },
                    { value: "CONTRACT", label: "Contract" },
                    { value: "INTERNSHIP", label: "Internship" },
                    { value: "FREELANCE", label: "Freelance" }
                  ]}
                  value={jobForm.type}
                  onChange={(value) => setJobForm(prev => ({ ...prev, type: value || 'FULL_TIME' }))}
                  required
                  leftSection={<IconClock size={16} />}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Department"
                  placeholder="e.g., Engineering, Marketing, Sales"
                  value={jobForm.department}
                  onChange={(e) => setJobForm(prev => ({ ...prev, department: e.target.value }))}
                  leftSection={<IconBuilding size={16} />}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Location"
                  placeholder="e.g., Remote, New York, London"
                  value={jobForm.location}
                  onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                  leftSection={<IconMapPin size={16} />}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Salary Range"
                  placeholder="e.g., $120,000 - $150,000 or Competitive"
                  value={jobForm.salary}
                  onChange={(e) => setJobForm(prev => ({ ...prev, salary: e.target.value }))}
                  leftSection={<IconCurrencyDollar size={16} />}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Posted Date"
                  type="date"
                  value={jobForm.postedDate}
                  onChange={(e) => setJobForm(prev => ({ ...prev, postedDate: e.target.value }))}
                  leftSection={<IconCalendar size={16} />}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Job Details Section */}
          <Paper withBorder p="md">
            <Group mb="md">
              <IconFileText size={18} />
              <Text fw={600} size="sm" tt="uppercase" c="dimmed">Job Details</Text>
            </Group>

            <Textarea
              label="Job Description"
              placeholder="Provide a comprehensive overview of the role, company culture, and what makes this position unique..."
              value={jobForm.description}
              onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
              error={!jobForm.description.trim() && "Job description is required"}
              autosize
              minRows={3}
              maxRows={6}
            />

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Textarea
                  label="Key Responsibilities"
                  placeholder="• Lead development of new features&#10;• Mentor junior developers&#10;• Collaborate with cross-functional teams"
                  value={jobForm.responsibilities}
                  onChange={(e) => setJobForm(prev => ({ ...prev, responsibilities: e.target.value }))}
                  rows={3}
                  autosize
                  minRows={2}
                  maxRows={4}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Textarea
                  label="Requirements & Qualifications"
                  placeholder="• Bachelor's degree in Computer Science&#10;• 5+ years of experience&#10;• Strong problem-solving skills"
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm(prev => ({ ...prev, requirements: e.target.value }))}
                  rows={3}
                  autosize
                  minRows={2}
                  maxRows={4}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Skills & Benefits Section */}
          <Paper withBorder p="md">
            <Group mb="md">
              <IconCheck size={18} />
              <Text fw={600} size="sm" tt="uppercase" c="dimmed">Skills & Benefits</Text>
            </Group>

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Required Skills"
                  placeholder="JavaScript, React, Node.js, TypeScript, AWS"
                  value={jobForm.skills.join(', ')}
                  onChange={(e) => setJobForm(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                  description="Separate multiple skills with commas"
                />
                {jobForm.skills.length > 0 && (
                  <Group gap="xs" mt="xs">
                    {jobForm.skills.map((skill, index) => (
                      <Chip key={index} size="sm" variant="light" color="blue">
                        {skill}
                      </Chip>
                    ))}
                  </Group>
                )}
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Benefits & Perks"
                  placeholder="Health Insurance, 401k, Remote Work, Flexible Hours"
                  value={jobForm.benefits.join(', ')}
                  onChange={(e) => setJobForm(prev => ({ ...prev, benefits: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                  description="Separate multiple benefits with commas"
                />
                {jobForm.benefits.length > 0 && (
                  <Group gap="xs" mt="xs">
                    {jobForm.benefits.map((benefit, index) => (
                      <Chip key={index} size="sm" variant="light" color="green">
                        {benefit}
                      </Chip>
                    ))}
                  </Group>
                )}
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Form Actions */}
          <Group justify="space-between" mt="lg">
            <Button 
              variant="light" 
              onClick={() => setJobModalOpen(false)}
              leftSection={<IconX size={16} />}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveJob}
              leftSection={<IconCheck size={16} />}
              disabled={!jobForm.title.trim() || !jobForm.description.trim()}
              loading={loading}
            >
              {editingJob ? 'Update Job' : 'Create Job'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Job Archive Confirmation Modal */}
      <Modal opened={jobConfirmOpen} onClose={() => setJobConfirmOpen(false)} title="Confirm Archive Job" centered>
        <Stack>
          <Alert color="orange" icon={<IconTrash size={16} />}>
            Are you sure you want to archive the job <strong>&quot;{jobToDelete?.title}&quot;</strong>? 
            <Text size="sm" mt="xs">
              This will hide the job from public listings but preserve all application data. You can reactivate it later.
            </Text>
          </Alert>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setJobConfirmOpen(false)}>Cancel</Button>
            <Button 
              color="orange" 
              onClick={() => {
                if (jobToDelete) {
                  deleteJob(jobToDelete.id);
                  setJobConfirmOpen(false);
                }
              }}
              loading={loading}
            >
              Archive Job
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Application Delete Confirmation Modal */}
      <Modal opened={applicationConfirmOpen} onClose={() => setApplicationConfirmOpen(false)} title="Confirm Delete Application" centered>
        <Stack>
          <Alert color="red" icon={<IconTrash size={16} />}>
            Are you sure you want to delete the application from <strong>&quot;{applicationToDelete?.name}&quot;</strong> for the job <strong>&quot;{applicationToDelete?.job?.title}&quot;</strong>? 
            <Text size="sm" mt="xs">
              This action cannot be undone.
            </Text>
          </Alert>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setApplicationConfirmOpen(false)}>Cancel</Button>
            <Button 
              color="red" 
              onClick={() => {
                if (applicationToDelete) {
                  deleteApplication(applicationToDelete.id);
                  setApplicationConfirmOpen(false);
                }
              }}
              loading={loading}
            >
              Delete Application
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}



