import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request) {
    try {
        // Get the request body
        const body = await request.json();
        
        // Forward the request to the backend
        const response = await fetch(`${BACKEND_URL}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        // Return the backend response
        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('Contact form submission error:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to connect to backend service. Please try again later.' 
            },
            { status: 500 }
        );
    }
}

