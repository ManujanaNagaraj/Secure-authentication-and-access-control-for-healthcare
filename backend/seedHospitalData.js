import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import PatientRecord from './models/PatientRecord.js';
import MedicationSchedule from './models/MedicationSchedule.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({ email: { $in: ['doctor1@hospital.com', 'nurse1@hospital.com', 'admin@hospital.com'] } });
    await PatientRecord.deleteMany({});
    await MedicationSchedule.deleteMany({});
    console.log('🗑️  Cleared existing seed data');

    // Create sample users
    console.log('👥 Creating sample users...');
    
    const doctor = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'doctor1@hospital.com',
      password: 'doctor123',
      role: 'doctor'
    });
    console.log('✅ Created doctor:', doctor.name);

    const nurse = await User.create({
      name: 'Emily Davis',
      email: 'nurse1@hospital.com',
      password: 'nurse123',
      role: 'nurse'
    });
    console.log('✅ Created nurse:', nurse.name);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hospital.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✅ Created admin:', admin.name);

    // Create sample patient records
    console.log('🏥 Creating sample patient records...');

    const patient1 = await PatientRecord.create({
      patientName: 'John Smith',
      patientAge: 45,
      roomNumber: '101',
      doctorId: doctor._id,
      diagnosis: 'Type 2 Diabetes Mellitus with mild hypertension',
      prescription: 'Metformin 500mg twice daily, Lisinopril 10mg once daily. Monitor blood glucose levels regularly.',
      notes: 'Patient education provided on diabetic diet. Follow-up in 2 weeks for lab review.',
      status: 'active',
      lastCheckup: new Date()
    });

    const patient2 = await PatientRecord.create({
      patientName: 'Mary Johnson',
      patientAge: 62,
      roomNumber: '102',
      doctorId: doctor._id,
      diagnosis: 'Congestive Heart Failure (CHF) with reduced ejection fraction',
      prescription: 'Furosemide 40mg daily, Carvedilol 12.5mg twice daily, Spironolactone 25mg daily. Fluid restriction 1.5L/day.',
      notes: 'Patient shows improvement. Daily weight monitoring essential. Dietary consultation scheduled.',
      status: 'active',
      lastCheckup: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    });

    const patient3 = await PatientRecord.create({
      patientName: 'Robert Brown',
      patientAge: 38,
      roomNumber: '103',
      doctorId: doctor._id,
      diagnosis: 'Community-acquired pneumonia, moderate severity',
      prescription: 'Azithromycin 500mg daily for 5 days, Acetaminophen 650mg every 6 hours as needed for fever.',
      notes: 'Chest X-ray shows right lower lobe consolidation. Respiratory therapy twice daily. Oxygen saturation monitoring.',
      status: 'active',
      lastCheckup: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    });

    console.log('✅ Created patient records');

    // Create medication schedules for today
    console.log('💊 Creating medication schedules...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Medications for John Smith
    await MedicationSchedule.create({
      patientName: 'John Smith',
      patientRecordId: patient1._id,
      medication: 'Metformin',
      dosage: '500mg',
      scheduledTime: '08:00 AM',
      nurseId: nurse._id,
      administered: true,
      date: today,
      administeredAt: new Date()
    });

    await MedicationSchedule.create({
      patientName: 'John Smith',
      patientRecordId: patient1._id,
      medication: 'Metformin',
      dosage: '500mg',
      scheduledTime: '08:00 PM',
      administered: false,
      date: today
    });

    await MedicationSchedule.create({
      patientName: 'John Smith',
      patientRecordId: patient1._id,
      medication: 'Lisinopril',
      dosage: '10mg',
      scheduledTime: '08:00 AM',
      nurseId: nurse._id,
      administered: true,
      date: today,
      administeredAt: new Date()
    });

    // Medications for Mary Johnson
    await MedicationSchedule.create({
      patientName: 'Mary Johnson',
      patientRecordId: patient2._id,
      medication: 'Furosemide',
      dosage: '40mg',
      scheduledTime: '09:00 AM',
      nurseId: nurse._id,
      administered: true,
      date: today,
      administeredAt: new Date()
    });

    await MedicationSchedule.create({
      patientName: 'Mary Johnson',
      patientRecordId: patient2._id,
      medication: 'Carvedilol',
      dosage: '12.5mg',
      scheduledTime: '08:00 AM',
      nurseId: nurse._id,
      administered: true,
      date: today,
      administeredAt: new Date()
    });

    await MedicationSchedule.create({
      patientName: 'Mary Johnson',
      patientRecordId: patient2._id,
      medication: 'Carvedilol',
      dosage: '12.5mg',
      scheduledTime: '08:00 PM',
      administered: false,
      date: today
    });

    await MedicationSchedule.create({
      patientName: 'Mary Johnson',
      patientRecordId: patient2._id,
      medication: 'Spironolactone',
      dosage: '25mg',
      scheduledTime: '09:00 AM',
      nurseId: nurse._id,
      administered: true,
      date: today,
      administeredAt: new Date()
    });

    // Medications for Robert Brown
    await MedicationSchedule.create({
      patientName: 'Robert Brown',
      patientRecordId: patient3._id,
      medication: 'Azithromycin',
      dosage: '500mg',
      scheduledTime: '10:00 AM',
      nurseId: nurse._id,
      administered: true,
      date: today,
      administeredAt: new Date()
    });

    await MedicationSchedule.create({
      patientName: 'Robert Brown',
      patientRecordId: patient3._id,
      medication: 'Acetaminophen',
      dosage: '650mg',
      scheduledTime: '02:00 PM',
      administered: false,
      date: today
    });

    await MedicationSchedule.create({
      patientName: 'Robert Brown',
      patientRecordId: patient3._id,
      medication: 'Acetaminophen',
      dosage: '650mg',
      scheduledTime: '08:00 PM',
      administered: false,
      date: today
    });

    console.log('✅ Created medication schedules');

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('--------------------------------');
    console.log('Doctor:');
    console.log('  Email: doctor1@hospital.com');
    console.log('  Password: doctor123');
    console.log('\nNurse:');
    console.log('  Email: nurse1@hospital.com');
    console.log('  Password: nurse123');
    console.log('\nAdmin:');
    console.log('  Email: admin@hospital.com');
    console.log('  Password: admin123');
    console.log('--------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
