import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const formData = await request.formData();
        
        // Extract form data
        const name = formData.get('name');
        const email = formData.get('email');
        const resume = formData.get('resume');

        // Validate required fields
        if (!name || !email || !resume) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Name, email, and resume are required fields.'
                },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Please enter a valid email address.'
                },
                { status: 400 }
            );
        }

        // Validate resume file
        if (resume && resume.size > 5 * 1024 * 1024) { // 5MB limit
            return NextResponse.json(
                {
                    success: false,
                    message: 'Resume file size must be less than 5MB.'
                },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (resume && !allowedTypes.includes(resume.type)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Resume must be a PDF, DOC, or DOCX file.'
                },
                { status: 400 }
            );
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

    

        // Return success response
        return NextResponse.json({
            success: true,
            message: 'Your application has been submitted successfully. We will review your information and get back to you soon.',
            data: {
                id: Date.now().toString(),
                submittedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Career form submission error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An unexpected error occurred. Please try again later.'
            },
            { status: 500 }
        );
    }
}

// Optional: GET endpoint to retrieve job listings
export async function GET() {
    try {
        // In a real application, you would fetch from a database
        const jobs = [
            {
                id: 1,
                title: "Senior Software Engineer",
                department: "Engineering",
                location: "Remote",
                type: "Full-time",
                salary: "$120,000 - $150,000",
                description: "We are looking for a Senior Software Engineer to join our team and help build innovative solutions.",
                requirements: "5+ years of experience in software development, proficiency in JavaScript, Python, and cloud technologies.",
                postedDate: "2024-01-15",
                skills: ["JavaScript", "Python", "React", "Node.js", "AWS"],
                benefits: ["Health Insurance", "401k", "Remote Work", "Flexible Hours"]
            },
            {
                id: 2,
                title: "Product Manager",
                department: "Product",
                location: "New York",
                type: "Full-time",
                salary: "$100,000 - $130,000",
                description: "Join our product team to drive the development of cutting-edge solutions.",
                requirements: "3+ years of product management experience, strong analytical skills, excellent communication.",
                postedDate: "2024-01-10",
                skills: ["Product Strategy", "Analytics", "User Research", "Agile"],
                benefits: ["Health Insurance", "401k", "Stock Options", "Professional Development"]
            }
        ];

        return NextResponse.json({
            success: true,
            jobs: jobs
        });

    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch job listings.'
            },
            { status: 500 }
        );
    }
}

