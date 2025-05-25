import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import mongoose from 'mongoose';
import type { NextRequest } from 'next/server';

// Import the User model
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  firstName: String,
  lastName: String,
  studentId: { 
    type: String,
    required: true,
    unique: true
  },
  password: String,
  email: String,
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  }
}));

export async function POST(request: NextRequest) {
  try {
    // Connect to database with error handling
    console.log('Connecting to database...');
    await dbConnect();
    
    // Verify connection
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. Current state:', mongoose.connection.readyState);
      throw new Error('Database connection failed');
    }
    console.log('Database connected successfully. Connection state:', mongoose.connection.readyState);

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { studentId, password } = body;
    console.log('Login attempt for student ID:', studentId);    // Find user without password filter to ensure we find the user
    console.log('Querying database for user with studentId:', studentId);
    console.log('Database connection state:', mongoose.connection.readyState);
    console.log('Available models:', Object.keys(mongoose.models));
    
    const user = await User.findOne({ studentId });
    console.log('User found:', user ? {
      id: user._id,
      studentId: user.studentId,
      role: user.role,
      firstName: user.firstName
    } : 'No user found');

    if (!user) {
      return NextResponse.json(
        { message: 'No account found with this Student ID' },
        { status: 401 }
      );
    }    // Compare passwords (case sensitive)
    console.log('Verifying password...');
    if (user.password !== password) {
      console.log('Password mismatch - Expected:', user.password, 'Received:', password);
      return NextResponse.json(
        { message: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = process.env.JWT_SECRET
      ? `mock_${process.env.JWT_SECRET}_${user._id}`
      : `mock_token_${user._id}`;

    console.log('Login successful');
    
    // Return successful response with user data including role
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        studentId: user.studentId,
        email: user.email,
        role: user.role
      },
      token,
      redirectUrl: user.role === 'admin' ? '/admin' : '/dashboard'
    }, { status: 200 });
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    
    // Handle specific database errors
    if (error.name === 'MongoServerError') {
      return NextResponse.json(
        { message: 'Database connection error. Please try again later.' },
        { status: 503 }
      );
    }
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
