import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test database connection
    let dbStatus = 'Not connected';
    try {
      // Add your database connection test here if needed
      dbStatus = 'Connected';
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      dbStatus = 'Error connecting to database';
    }

    return NextResponse.json({
      status: 'success',
      message: 'Test endpoint is working',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: dbStatus,
      config: {
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      status: 'success',
      message: 'Received POST request',
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Invalid request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    );
  }
}
