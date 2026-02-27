import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import MedicalRecord from './models/MedicalRecord.js';
import Appointment from './models/Appointment.js';

// Load environment variables
dotenv.config();

// Sample data
const sampleUsers = {
  patients: [
    { name: 'John Doe', email: 'john@patient.com', password: 'password123', role: 'patient' },
    { name: 'Jane Smith', email: 'jane@patient.com', password: 'password123', role: 'patient' },
    { name: 'Bob Johnson', email: 'bob@patient.com', password: 'password123', role: 'patient' }
  ],
  doctors: [
    { name: 'Dr. Sarah Wilson', email: 'sarah@doctor.com', password: 'password123', role: 'doctor' },
    { name: 'Dr. Michael Chen', email: 'michael@doctor.com', password: 'password123', role: 'doctor' }
  ],
  admins: [
    { name: 'Admin User', email: 'admin@healthcare.com', password: 'password123', role: 'admin' }
  ]
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Appointment.deleteMany({});

    // Create users
    console.log('Creating users...');
    const createdPatients = await User.create(sampleUsers.patients);
    const createdDoctors = await User.create(sampleUsers.doctors);
    const createdAdmins = await User.create(sampleUsers.admins);

    console.log('Created patients:', createdPatients.length);
    console.log('Created doctors:', createdDoctors.length);
    console.log('Created admins:', createdAdmins.length);

    // Create medical records
    console.log('Creating medical records...');
    const medicalRecords = [
      {
        patientId: createdPatients[0]._id,
        doctorId: createdDoctors[0]._id,
        diagnosis: 'Seasonal Flu',
        prescription: 'Tamiflu 75mg, twice daily for 5 days',
        notes: 'Patient advised to rest and stay hydrated'
      },
      {
        patientId: createdPatients[0]._id,
        doctorId: createdDoctors[0]._id,
        diagnosis: 'High Blood Pressure',
        prescription: 'Lisinopril 10mg, once daily',
        notes: 'Follow-up in 2 weeks. Monitor BP daily.'
      },
      {
        patientId: createdPatients[1]._id,
        doctorId: createdDoctors[1]._id,
        diagnosis: 'Type 2 Diabetes',
        prescription: 'Metformin 500mg, twice daily with meals',
        notes: 'Diet and exercise plan discussed. HbA1c to be checked in 3 months.'
      },
      {
        patientId: createdPatients[2]._id,
        doctorId: createdDoctors[0]._id,
        diagnosis: 'Migraine',
        prescription: 'Sumatriptan 50mg as needed',
        notes: 'Avoid triggers: bright lights, loud noises, stress'
      }
    ];

    await MedicalRecord.create(medicalRecords);
    console.log('Created medical records:', medicalRecords.length);

    // Create appointments
    console.log('Creating appointments...');
    const today = new Date();
    const appointments = [
      {
        patientId: createdPatients[0]._id,
        doctorId: createdDoctors[0]._id,
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        time: '10:00 AM',
        status: 'scheduled',
        reason: 'Follow-up checkup'
      },
      {
        patientId: createdPatients[1]._id,
        doctorId: createdDoctors[1]._id,
        date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        time: '2:30 PM',
        status: 'scheduled',
        reason: 'Diabetes management consultation'
      },
      {
        patientId: createdPatients[2]._id,
        doctorId: createdDoctors[0]._id,
        date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        time: '11:00 AM',
        status: 'completed',
        reason: 'Annual physical examination'
      },
      {
        patientId: createdPatients[0]._id,
        doctorId: createdDoctors[1]._id,
        date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        time: '3:00 PM',
        status: 'scheduled',
        reason: 'Vaccination appointment'
      }
    ];

    await Appointment.create(appointments);
    console.log('Created appointments:', appointments.length);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample Credentials:');
    console.log('─────────────────────────────────────');
    console.log('\n👤 PATIENT:');
    console.log('   Email: john@patient.com');
    console.log('   Password: password123');
    console.log('\n👨‍⚕️ DOCTOR:');
    console.log('   Email: sarah@doctor.com');
    console.log('   Password: password123');
    console.log('\n🔐 ADMIN:');
    console.log('   Email: admin@healthcare.com');
    console.log('   Password: password123');
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
