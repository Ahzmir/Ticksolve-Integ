const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://ahzmirdegracia:PBi9H4EIMWLPJki1@ticksolve.d8p82g0.mongodb.net/ticketsolver?retryWrites=true&w=majority&appName=ticksolve&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000";

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Successfully connected to MongoDB!');
        
        // Create a simple test document
        const Test = mongoose.model('Test', new mongoose.Schema({ name: String }));
        await Test.create({ name: 'test' });
        console.log('Successfully created test document!');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

testConnection();
