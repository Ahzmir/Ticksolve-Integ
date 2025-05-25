import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://ahzmirdegracia:PBi9H4EIMWLPJki1@ticksolve.d8p82g0.mongodb.net/ticketsolver?retryWrites=true&w=majority";

if (!MONGODB_URI) {
  throw new Error('MongoDB URI is not defined');
}

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections growing exponentially
// during API Route usage.
let cached: any = global as any;

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  try {
    if (cached.mongoose.conn) {
      console.log('Using cached connection');
      return cached.mongoose.conn;
    }

    if (!cached.mongoose.promise) {      const opts: mongoose.ConnectOptions = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 60000,
        family: 4, // Use IPv4, skip trying IPv6
        retryWrites: true,
        w: 'majority',
        connectTimeoutMS: 30000,
        ssl: true,
        authSource: 'admin'
      };      console.log('Connecting to MongoDB Atlas with URI:', MONGODB_URI?.substring(0, MONGODB_URI.indexOf('@')));
      cached.mongoose.promise = mongoose.connect(MONGODB_URI!, {
        ...opts,
        authSource: 'admin',
        dbName: 'ticketsolver'
      })
        .then((mongoose) => {
          console.log('MongoDB Atlas connected successfully');
          return mongoose;
        })
        .catch((error) => {
          console.error('MongoDB connection error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            codeName: error.codeName
          });
          throw error;
        });
    }
  
    cached.mongoose.conn = await cached.mongoose.promise;
    return cached.mongoose.conn;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export default dbConnect;