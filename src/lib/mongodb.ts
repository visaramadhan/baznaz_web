import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Fallback for debugging if env var is not loaded
  if (process.env.NODE_ENV === 'development') {
     console.warn('MONGODB_URI not found in process.env, using hardcoded fallback for dev.');
  }
  // throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Hardcode for now to unblock if env fails
const FINAL_URI = MONGODB_URI || "mongodb+srv://visaramadhan28_db_user:kASTyRgEMUzLB85a@cluster0.eifm61e.mongodb.net/?appName=Cluster0";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(FINAL_URI, opts).then((mongoose) => {
      return mongoose.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
