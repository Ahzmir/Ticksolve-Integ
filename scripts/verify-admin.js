const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = "mongodb+srv://ahzmirdegracia:PBi9H4EIMWLPJki1@ticksolve.d8p82g0.mongodb.net/?retryWrites=true&w=majority&appName=ticksolve";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  studentId: String,
  password: String,
  email: String,
  role: String
});

async function verifyAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      authSource: 'admin',
      dbName: 'ticketsolver',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('Connected successfully');

    const User = mongoose.model('User', userSchema);
    
    console.log('Looking for admin user...');
    const adminUser = await User.findOne({ studentId: 'admin123' });
    
    if (adminUser) {
      console.log('Admin user found:', {
        id: adminUser._id,
        studentId: adminUser.studentId,
        role: adminUser.role,
        firstName: adminUser.firstName
      });
    } else {
      console.log('No admin user found');
    }

    console.log('\nListing all users:');
    const allUsers = await User.find({});
    console.log('Total users:', allUsers.length);
    allUsers.forEach(user => {
      console.log('User:', {
        id: user._id,
        studentId: user.studentId,
        role: user.role,
        firstName: user.firstName
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

verifyAdmin();
