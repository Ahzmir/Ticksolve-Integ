const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = "mongodb+srv://ahzmirdegracia:PBi9H4EIMWLPJki1@ticksolve.d8p82g0.mongodb.net/ticketsolver?retryWrites=true&w=majority";

if (!MONGODB_URI) {
  console.error('MongoDB URI is not defined');
  process.exit(1);
}

// Define the User schema
const userSchema = new mongoose.Schema({
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
});

// Create the User model
const User = mongoose.model('User', userSchema);

async function createTestStudent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create test student user
    const studentUser = new User({
      firstName: 'Test',
      lastName: 'Student',
      studentId: '12345',
      password: 'student123',
      email: 'student@example.com',
      role: 'student'
    });

    // Save the student user
    await studentUser.save();
    console.log('Test student created successfully');

  } catch (error) {
    console.error('Error creating test student:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

// Run the script
createTestStudent();
