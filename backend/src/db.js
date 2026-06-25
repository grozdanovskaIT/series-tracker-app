import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/series_tracker';

export async function connectDatabase() {
  await mongoose.connect(mongoUri);
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
