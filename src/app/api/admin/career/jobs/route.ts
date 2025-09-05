import { NextResponse } from 'next/server';

// Mock data - in a real app, this would come from a database
const mockJobs = [
  {
    id: 1,
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    salary: "$120,000 - $150,000",
    description: "We are looking for a Senior Software Engineer to join our team and help build innovative solutions. You will be responsible for developing high-quality software, mentoring junior developers, and collaborating with cross-functional teams.",
    requirements: "5+ years of experience in software development, proficiency in JavaScript, Python, and cloud technologies. Experience with React, Node.js, and AWS is preferred.",
    responsibilities: "Lead technical projects, mentor junior developers, collaborate with cross-functional teams, and contribute to architectural decisions.",
    postedDate: "2024-01-15",
    skills: ["JavaScript", "Python", "React", "Node.js", "AWS"],
    benefits: ["Health Insurance", "401k", "Remote Work", "Flexible Hours"],
    isActive: true,
    applicationsCount: 12
  },
  {
    id: 2,
    title: "Product Manager",
    department: "Product",
    location: "New York",
    type: "Full-time",
    salary: "$100,000 - $130,000",
    description: "Join our product team to drive the development of cutting-edge solutions. You will be responsible for defining product strategy, working with engineering teams, and analyzing market trends.",
    requirements: "3+ years of product management experience, strong analytical skills, excellent communication abilities, and experience with agile methodologies.",
    responsibilities: "Define product strategy, work with engineering teams, analyze market trends, and prioritize feature development.",
    postedDate: "2024-01-10",
    skills: ["Product Strategy", "Analytics", "User Research", "Agile"],
    benefits: ["Health Insurance", "401k", "Stock Options", "Professional Development"],
    isActive: true,
    applicationsCount: 8
  },
  {
    id: 3,
    title: "UX Designer",
    department: "Design",
    location: "Los Angeles",
    type: "Full-time",
    salary: "$80,000 - $110,000",
    description: "Create beautiful and intuitive user experiences for our products. You will be responsible for designing user interfaces, conducting user research, and collaborating with development teams.",
    requirements: "2+ years of UX design experience, proficiency in Figma, user research skills, and a strong portfolio demonstrating user-centered design.",
    responsibilities: "Design user interfaces, conduct user research, collaborate with development teams, and maintain design systems.",
    postedDate: "2024-01-08",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
    benefits: ["Health Insurance", "401k", "Design Tools", "Conference Budget"],
    isActive: false,
    applicationsCount: 15
  },
  {
    id: 4,
    title: "Marketing Specialist",
    department: "Marketing",
    location: "Remote",
    type: "Part-time",
    salary: "$50,000 - $70,000",
    description: "Help us grow our brand and reach new customers through innovative marketing strategies. You will develop marketing campaigns, manage social media, and create engaging content.",
    requirements: "2+ years of marketing experience, social media expertise, content creation skills, and experience with marketing analytics tools.",
    responsibilities: "Develop marketing campaigns, manage social media presence, create content, and analyze campaign performance.",
    postedDate: "2024-01-05",
    skills: ["Social Media", "Content Creation", "Analytics", "Campaign Management"],
    benefits: ["Flexible Hours", "Remote Work", "Professional Development"],
    isActive: true,
    applicationsCount: 6
  },
  {
    id: 5,
    title: "Data Scientist",
    department: "Engineering",
    location: "Chicago",
    type: "Full-time",
    salary: "$110,000 - $140,000",
    description: "Analyze complex data sets to drive business decisions and product improvements. You will build predictive models, analyze data trends, and present insights to stakeholders.",
    requirements: "3+ years of data science experience, Python/R proficiency, machine learning expertise, and strong statistical analysis skills.",
    responsibilities: "Build predictive models, analyze data trends, present insights to stakeholders, and collaborate with product teams.",
    postedDate: "2024-01-03",
    skills: ["Python", "R", "Machine Learning", "SQL", "Statistics"],
    benefits: ["Health Insurance", "401k", "Remote Work", "Conference Budget"],
    isActive: true,
    applicationsCount: 9
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department') || '';
    const location = searchParams.get('location') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || 'all';

    // Filter jobs based on criteria
    const filteredJobs = mockJobs.filter(job => {
      const matchesDepartment = !department || job.department === department;
      const matchesLocation = !location || job.location === location;
      const matchesType = !type || job.type === type;
      const matchesStatus = status === 'all' || 
        (status === 'active' && job.isActive) || 
        (status === 'inactive' && !job.isActive);
      
      return matchesDepartment && matchesLocation && matchesType && matchesStatus;
    });

    return NextResponse.json({
      success: true,
      data: {
        jobs: filteredJobs,
        total: filteredJobs.length
      }
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch jobs'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, department, location, type, salary, description, requirements, responsibilities, postedDate, skills, benefits } = body;

    // Validate required fields
    if (!title || !department || !location || !type || !salary || !description) {
      return NextResponse.json(
        {
          success: false,
          message: 'Title, department, location, type, salary, and description are required'
        },
        { status: 400 }
      );
    }

    // In a real app, you would save to database
    const newJob = {
      id: Date.now(),
      title,
      department,
      location,
      type,
      salary,
      description,
      requirements: requirements || '',
      responsibilities: responsibilities || '',
      postedDate: postedDate || new Date().toISOString().split('T')[0],
      skills: skills || [],
      benefits: benefits || [],
      isActive: true,
      applicationsCount: 0
    };


    return NextResponse.json({
      success: true,
      message: 'Job created successfully',
      data: newJob
    });

  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create job'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { jobId, updates } = body;

    if (!jobId || !updates) {
      return NextResponse.json(
        {
          success: false,
          message: 'Job ID and updates are required'
        },
        { status: 400 }
      );
    }

    // In a real app, you would update the database

    return NextResponse.json({
      success: true,
      message: 'Job updated successfully'
    });

  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update job'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Job ID is required'
        },
        { status: 400 }
      );
    }

    // Call the backend API to delete the job
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/admin/career/jobs?id=${jobId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.error || 'Failed to delete job'
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
      data: data.data
    });

  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete job'
      },
      { status: 500 }
    );
  }
}

