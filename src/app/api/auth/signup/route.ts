import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, studentId, password, email } = body;

    // Validate required fields
    if (!name || !studentId || !password) {
      return NextResponse.json(
        { message: 'Name, Student ID, and password are required' },
        { status: 400 }
      );
    }

    // Validate student ID format
    if (!/^\d+$/.test(studentId)) {
      return NextResponse.json(
        { message: 'Student ID must contain only numbers' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ studentId });
    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this Student ID already exists' },
        { status: 409 }
      );
    }    // Create new user
    const user = await User.create({
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1] || '',
      studentId,
      password, // In a real app, hash the password before saving
      email,
      role: 'student' // By default, all new users are students
    });

    // Generate token
    const token = process.env.JWT_SECRET
      ? `mock_${process.env.JWT_SECRET}_${user._id}`
      : `mock_token_${user._id}`;

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        studentId: user.studentId,
        email: user.email
      },
      token
    }, { status: 201 });

  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to create account', error: error.message },
      { status: 500 }
    );
  }
}
