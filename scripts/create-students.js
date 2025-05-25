const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = "mongodb+srv://ahzmirdegracia:PBi9H4EIMWLPJki1@ticksolve.d8p82g0.mongodb.net/ticketsolver?retryWrites=true&w=majority";

if (!MONGODB_URI) {
  console.error('MongoDB URI is not defined');
  process.exit(1);
}

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

const User = mongoose.model('User', userSchema);

const students = [
  {
    firstName: 'John',
    lastName: 'Doe',
    studentId: '123456',
    password: 'student123',
    email: 'john.doe@student.com',
    role: 'student'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    studentId: '234567',
    password: 'student123',
    email: 'jane.smith@student.com',
    role: 'student'
  },
  {
    firstName: 'Michael',
    lastName: 'Johnson',
    studentId: '345678',
    password: 'student123',
    email: 'michael.johnson@student.com',
    role: 'student'
  },
  {
    firstName: 'Sarah',
    lastName: 'Williams',
    studentId: '456789',
    password: 'student123',
    email: 'sarah.williams@student.com',
    role: 'student'
  }
];

async function createStudents() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: 'ticketsolver',
      authSource: 'admin',
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000
    });
    console.log('Connected to MongoDB successfully');

    // First, let's check if the students already exist
    for (const studentData of students) {
      try {
        const existingStudent = await User.findOne({ studentId: studentData.studentId });
        if (existingStudent) {
          console.log(`Student with ID ${studentData.studentId} already exists, skipping...`);
          continue;
        }

        const student = new User(studentData);
        const savedStudent = await student.save();
        console.log(`Successfully created student:`, {
          id: savedStudent._id,
          name: `${savedStudent.firstName} ${savedStudent.lastName}`,
          studentId: savedStudent.studentId
        });
      } catch (error) {
        console.error(`Error creating student ${studentData.studentId}:`, error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          code: error.code
        });
      }
    }

    // Verify the created students
    console.log('\nVerifying created students...');
    const allStudents = await User.find({ role: 'student' });
    console.log(`Total students in database: ${allStudents.length}`);
    allStudents.forEach(student => {
      console.log(`- ${student.firstName} ${student.lastName} (ID: ${student.studentId})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

createStudents();
