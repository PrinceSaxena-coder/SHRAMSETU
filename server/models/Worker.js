import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  serviceCategory: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  experience: {
    type: Number,
    default: 0,
  },
  address: {
    type: String,
    trim: true,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

workerSchema.index({ serviceCategory: 1, isAvailable: 1 });
workerSchema.index({ latitude: 1, longitude: 1 });

const Worker = mongoose.models.Worker || mongoose.model('Worker', workerSchema);

export default Worker;
