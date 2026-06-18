import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI?.trim() || '';
const FINAL_URI = MONGODB_URI;

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
    // #region debug-point A:db-connect-start
    (()=>{const fs=require('fs');let u='http://127.0.0.1:7777/event',s='login-mongodb-dns';try{const e=fs.readFileSync('.dbg/login-mongodb-dns.env','utf8');u=e.match(/DEBUG_SERVER_URL=(.+)/)?.[1]||u;s=e.match(/DEBUG_SESSION_ID=(.+)/)?.[1]||s}catch{}fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:s,runId:'pre-fix',hypothesisId:'A',location:'src/lib/mongodb.ts:dbConnect',msg:'[DEBUG] opening mongoose connection',data:{hasEnv:Boolean(process.env.MONGODB_URI),uriHost:(FINAL_URI.match(/@([^/?]+)/)?.[1]||'')},ts:Date.now()})}).catch(()=>{});})();
    // #endregion
    if (!FINAL_URI) {
      throw new Error('MONGODB_URI tidak tersedia pada runtime server');
    }
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
