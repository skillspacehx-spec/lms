import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check database connection
    await connectDB();
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: dbStatus,
          responseTime: Date.now() - startTime
        }
      }
    };

    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    const response = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      services: {
        database: {
          status: 'disconnected',
          responseTime: Date.now() - startTime
        }
      }
    };

    return NextResponse.json(response, { status: 503 });
  }
}