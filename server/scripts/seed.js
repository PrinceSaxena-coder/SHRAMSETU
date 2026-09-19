import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

import Service from '../models/Service.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const shouldClear = process.argv.includes('--clear');

const servicesSeed = [
  {
    name: 'Wiring Repair',
    category: 'Electrical',
    description: 'Fix loose sockets, damaged wiring, and minor electrical faults.',
    basePrice: 250,
    isActive: true,
  },
  {
    name: 'Switchboard Installation',
    category: 'Electrical',
    description: 'Install or replace switchboards and basic electrical fittings.',
    basePrice: 300,
    isActive: true,
  },
  {
    name: 'Leak Fixing',
    category: 'Plumbing',
    description: 'Repair pipe leaks, dripping taps, and minor water line issues.',
    basePrice: 220,
    isActive: true,
  },
  {
    name: 'Pipe Installation',
    category: 'Plumbing',
    description: 'Install or replace water pipes for kitchens, bathrooms, and utility areas.',
    basePrice: 350,
    isActive: true,
  },
  {
    name: 'Furniture Repair',
    category: 'Carpentry',
    description: 'Repair chairs, tables, doors, cabinets, and simple woodwork.',
    basePrice: 300,
    isActive: true,
  },
  {
    name: 'Room Painting',
    category: 'Painting',
    description: 'Fresh wall painting for rooms, touch-ups, and maintenance work.',
    basePrice: 260,
    isActive: true,
  },
  {
    name: 'Deep Home Cleaning',
    category: 'Cleaning',
    description: 'Vacuuming, mopping, surface cleaning, and room refresh service.',
    basePrice: 180,
    isActive: true,
  },
  {
    name: 'Appliance Repair',
    category: 'Appliance',
    description: 'Basic repair and troubleshooting for common household appliances.',
    basePrice: 280,
    isActive: true,
  },
];

const demoAuthUsers = [
  {
    name: 'Demo Customer',
    email: 'customer@shramsetu.in',
    phone: '+91 90000 00001',
    password: '123456',
    role: 'customer',
  },
  {
    name: 'Demo Worker',
    email: 'worker@shramsetu.in',
    phone: '+91 90000 00002',
    password: '123456',
    role: 'worker',
  },
  {
    name: 'Demo Admin',
    email: 'admin@shramsetu.in',
    phone: '+91 90000 00003',
    password: '123456',
    role: 'admin',
  },
];

const customersSeed = [
  {
    name: 'Aisha Sharma',
    email: 'aisha.sharma@example.com',
    phone: '+91 98765 90001',
    role: 'customer',
  },
];

const workersSeed = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '+91 98765 10001',
    serviceCategory: 'Electrical',
    latitude: 26.9124,
    longitude: 75.7873,
    rating: 4.8,
    experience: 7,
    address: 'Vaishali Nagar, Jaipur',
    isAvailable: true,
  },
  {
    name: 'Amit Verma',
    email: 'amit.verma@example.com',
    phone: '+91 98765 10002',
    serviceCategory: 'Plumbing',
    latitude: 26.906,
    longitude: 75.79,
    rating: 4.7,
    experience: 6,
    address: 'Malviya Nagar, Jaipur',
    isAvailable: true,
  },
  {
    name: 'Mohammed Arif',
    email: 'mohammed.arif@example.com',
    phone: '+91 98765 10003',
    serviceCategory: 'Carpentry',
    latitude: 26.915,
    longitude: 75.772,
    rating: 4.5,
    experience: 8,
    address: 'Sodala, Jaipur',
    isAvailable: true,
  },
  {
    name: 'Meena Patel',
    email: 'meena.patel@example.com',
    phone: '+91 98765 10004',
    serviceCategory: 'Cleaning',
    latitude: 26.92,
    longitude: 75.801,
    rating: 4.6,
    experience: 5,
    address: 'Civil Lines, Jaipur',
    isAvailable: true,
  },
  {
    name: 'Ravi Singh',
    email: 'ravi.singh@example.com',
    phone: '+91 98765 10005',
    serviceCategory: 'Painting',
    latitude: 26.91,
    longitude: 75.82,
    rating: 4.4,
    experience: 4,
    address: 'Mansarovar, Jaipur',
    isAvailable: true,
  },
];

async function ensureDemoAuthUsers() {
  const demoUsers = await Promise.all(
    demoAuthUsers.map(async (user) => {
      const passwordHash = await bcrypt.hash(user.password, 12);

      const existingUser = await User.findOne({ email: user.email.toLowerCase() });

      if (existingUser) {
        existingUser.name = user.name;
        existingUser.phone = user.phone;
        existingUser.role = user.role;
        existingUser.passwordHash = passwordHash;
        await existingUser.save();
        return existingUser;
      }

      return User.create({
        name: user.name,
        email: user.email.toLowerCase(),
        phone: user.phone,
        passwordHash,
        role: user.role,
      });
    })
  );

  const workerUser = demoUsers.find((user) => user.email === 'worker@shramsetu.in');
  if (workerUser) {
    await Worker.findOneAndUpdate(
      { userId: workerUser._id },
      {
        userId: workerUser._id,
        name: 'Demo Worker',
        serviceCategory: 'Electrical',
        phone: '+91 90000 00002',
        rating: 4.9,
        experience: 6,
        address: 'Vaishali Nagar, Jaipur',
        latitude: 26.9124,
        longitude: 75.7873,
        isAvailable: true,
      },
      { upsert: true, new: true }
    );
  }

  console.log('Ensured demo auth users exist with working credentials.');
}

async function runSeed() {
  const existingServices = await Service.countDocuments();
  const existingWorkers = await Worker.countDocuments();

  if (shouldClear) {
    await Service.deleteMany({});
    await Worker.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing dev data.');
  }

  if (!shouldClear && (existingServices > 0 || existingWorkers > 0)) {
    console.log('Existing development data detected. Ensuring demo auth accounts are present for login.');
  }

  if (shouldClear || existingServices === 0) {
    const seededServices = await Service.insertMany(servicesSeed);
    console.log(`Inserted ${seededServices.length} services.`);
  } else {
    console.log('Kept existing services; no service reseed performed.');
  }

  const createdCustomers = await Promise.all(
    customersSeed.map((customer) =>
      User.findOneAndUpdate(
        { email: customer.email.toLowerCase() },
        {
          name: customer.name,
          email: customer.email.toLowerCase(),
          phone: customer.phone,
          role: customer.role,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  const createdUsers = await Promise.all(
    workersSeed.map((worker) =>
      User.findOneAndUpdate(
        { email: worker.email.toLowerCase() },
        {
          name: worker.name,
          email: worker.email.toLowerCase(),
          phone: worker.phone,
          role: 'worker',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  const workerDocuments = createdUsers.map((user, index) => ({
    userId: user._id,
    name: workersSeed[index].name,
    serviceCategory: workersSeed[index].serviceCategory,
    phone: workersSeed[index].phone,
    rating: workersSeed[index].rating,
    experience: workersSeed[index].experience,
    address: workersSeed[index].address,
    latitude: workersSeed[index].latitude,
    longitude: workersSeed[index].longitude,
    isAvailable: workersSeed[index].isAvailable,
  }));

  await Promise.all(
    workerDocuments.map((workerDoc) =>
      Worker.findOneAndUpdate(
        { userId: workerDoc.userId },
        workerDoc,
        { upsert: true, new: true }
      )
    )
  );

  await ensureDemoAuthUsers();
  console.log(`Inserted/updated ${createdCustomers.length} customers.`);
  console.log(`Inserted/updated ${createdUsers.length} workers.`);
}

try {
  const mongoose = await import('mongoose');
  await mongoose.default.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected successfully for seed script.');
  await runSeed();
  console.log('Seed script completed successfully.');
  await mongoose.default.disconnect();
  process.exit(0);
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exit(1);
}
