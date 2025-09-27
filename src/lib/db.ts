import mongoose from 'mongoose';
import { logActivity } from './activity-log';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

let loggedConnection = false;

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  
  if (!loggedConnection) {
      // Use the username from the URI for logging
      const uriUser = MONGODB_URI.split('//')[1].split(':')[0];
      await logActivity('db-connection', uriUser || 'jhonvivasproject');
      loggedConnection = true;
  }

  return cached.conn;
}

export default dbConnect;
