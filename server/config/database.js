import mongoose from 'mongoose';

// Keep the database connection logic separate from routes/controllers.
// This makes it easier to replace the database layer later without changing APIs.
export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing. Add it to the root .env file before starting the server.');
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed.');
    throw error;
  }
}
