import { NextResponse } from 'next/server';

// Mock data - in a real app, this would come from a database
const mockApplications = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    position: "Senior Software Engineer",
    message: "I'm excited about this opportunity and believe my experience aligns perfectly with your requirements. I have 5+ years of experience in software development and have worked on similar projects.",
    resumeName: "john_doe_resume.pdf",
    resumeSize: 245760,
    submittedAt: "2024-01-20T10:30:00Z",
    status: "pending",
    jobId: 1,
    jobTitle: "Senior Software Engineer"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 987-6543",
    position: "Product Manager",
    message: "I have extensive experience in product management and would love to contribute to your team. I've successfully launched several products and have strong analytical skills.",
    resumeName: "jane_smith_cv.pdf",
    resumeSize: 189440,
    submittedAt: "2024-01-19T14:15:00Z",
    status: "reviewed",
    jobId: 2,
    jobTitle: "Product Manager"
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    position: "UX Designer",
    resumeName: "mike_johnson_portfolio.pdf",
    resumeSize: 512000,
    submittedAt: "2024-01-18T09:45:00Z",
    status: "shortlisted",
    jobId: 3,
    jobTitle: "UX Designer"
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    phone: "+1 (555) 456-7890",
    position: "Data Scientist",
    message: "I'm passionate about data science and machine learning. I have experience with Python, R, and various ML frameworks.",
    resumeName: "sarah_wilson_resume.pdf",
    resumeSize: 320000,
    submittedAt: "2024-01-17T16:20:00Z",
    status: "pending",
    jobId: 5,
    jobTitle: "Data Scientist"
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@example.com",
    phone: "+1 (555) 789-0123",
    position: "Marketing Specialist",
    message: "I have a strong background in digital marketing and social media management. I've helped grow several brands' online presence.",
    resumeName: "david_brown_cv.pdf",
    resumeSize: 156000,
    submittedAt: "2024-01-16T11:30:00Z",
    status: "rejected",
    jobId: 4,
    jobTitle: "Marketing Specialist"
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    // Filter applications based on search and status
    const filteredApplications = mockApplications.filter(app => {
      const matchesSearch = search === '' || 
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.email.toLowerCase().includes(search.toLowerCase()) ||
        app.position.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = status === 'all' || app.status === status;
      
      return matchesSearch && matchesStatus;
    });

    // Calculate pagination
    const total = filteredApplications.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        applications: paginatedApplications,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch applications'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: 'Application ID and status are required'
        },
        { status: 400 }
      );
    }

    // In a real app, you would update the database
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully'
    });

  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update application'
      },
      { status: 500 }
    );
  }
}

