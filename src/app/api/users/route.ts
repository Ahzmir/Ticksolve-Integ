import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import mongoose from 'mongoose';

// Import or define the User model
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

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');

        // If role is specified, filter by role, otherwise return all users
        const query = role ? { role } : {};
        const users = await User.find(query).select('-password'); // Exclude password from results

        return NextResponse.json(users);
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { message: 'Failed to fetch users', error: error.message },
            { status: 500 }
        );
    }
}
