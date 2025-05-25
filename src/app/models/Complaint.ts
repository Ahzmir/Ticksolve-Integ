import mongoose from "mongoose";


export interface IComplaintComment {
  userId: any;
  content: string;
  isAdminComment?: boolean;
  createdAt: Date;
}

// Define the interface for a complaint
export interface IComplaint {
  id: any;
  user: any;
  studentId: string;
  complaintType: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "pending";
  createdAt: Date;
  updatedAt?: Date;
  comments?: IComplaintComment[]; // <- Add this
}

const ComplaintSchema = new mongoose.Schema<IComplaint>({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    trim: true,
    minlength: [3, 'Student ID must be at least 3 characters long']
  },
  complaintType: {
    type: String,
    required: [true, 'Complaint type is required'],
    trim: true,
    enum: {
      values: ['bullying', 'cafeteria', 'grade', 'academic', 'technical', 'administrative', 'facility', 'other'],
      message: '{VALUE} is not a valid complaint type'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['open', 'in-progress', 'resolved', 'pending'],
      message: '{VALUE} is not a valid status'
    },
    default: 'open'
  },
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    isAdminComment: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
    virtuals: true
  }
});

// Add middleware to handle updates
ComplaintSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Add index for faster queries
ComplaintSchema.index({ studentId: 1, createdAt: -1 });

const Complaint = mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);

export default Complaint;