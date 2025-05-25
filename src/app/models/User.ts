import mongoose from "mongoose";

// Define the interface for a user
export interface IUser {
    firstName: string;
    lastName: string;
    studentId: string;
    password: string;
    email?: string;
    course?: string;
    role: 'student' | 'admin';
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    studentId: { 
        type: String, 
        required: [true, 'Student ID is required'],
        unique: true,
        trim: true,
        match: [/^\d+$/, 'Student ID must contain only numbers']
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    email: { 
        type: String, 
        unique: true, 
        sparse: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    course: { type: String },
    role: { 
        type: String, 
        enum: ['student', 'admin'],
        default: 'student',
        required: true
    }
}, { 
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.__v;
            ret.id = ret._id;
            delete ret._id;
            return ret;
        }
    }
});

// Handle duplicate key errors
userSchema.post('save', function(error: any, doc: any, next: any) {
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        if (error.code === 11000) {
            next(new Error('Student ID or Email already exists'));
        }
    }
    next(error);
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
