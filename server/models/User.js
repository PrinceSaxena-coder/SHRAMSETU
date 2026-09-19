import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
    unique: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  passwordHash: {
    type: String,
    select: false,
  },
  role: {
    type: String,
    required: true,
    enum: ['customer', 'worker', 'admin'],
    default: 'customer',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
