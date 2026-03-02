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
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({ email: { $in: ['doctor1@hospital.com', 'doctor2@hospital.com', 'nurse1@hospital.com', 'admin@hospital.com'] } });
    await PatientRecord.deleteMany({});
    await MedicationSchedule.deleteMany({});
    console.log('🗑️  Cleared existing seed data');

    // Create sample users
    console.log('👥 Creating sample users...');
    
    const doctor1 = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'doctor1@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      specialization: 'Cardiologist'
    });
    console.log('✅ Created doctor:', doctor1.name, '-', doctor1.specialization);

    const doctor2 = await User.create({
      name: 'Dr. Michael Chen',
      email: 'doctor2@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      specialization: 'Surgeon'
    });
    console.log('✅ Created doctor:', doctor2.name, '-', doctor2.specialization);

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

    // Cardiology Department Patients (Cardiologist - Dr. Sarah Johnson)
    const patient1 = await PatientRecord.create({
      patientName: 'John Smith',
      patientAge: 62,
      roomNumber: '201',
      doctorId: doctor1._id,
      assignedDoctorId: doctor1._id,
      assignedDoctorName: doctor1.name,
      department: 'Cardiologist',
      diagnosis: 'Congestive Heart Failure (CHF) with reduced ejection fraction',
      prescription: 'Furosemide 40mg daily, Carvedilol 12.5mg twice daily, Spironolactone 25mg daily. Fluid restriction 1.5L/day.',
      notes: 'Patient shows improvement. Daily weight monitoring essential. Dietary consultation scheduled.',
      status: 'active',
      lastCheckup: new Date()
    });

    const patient2 = await PatientRecord.create({
      patientName: 'Mary Johnson',
      patientAge: 55,
      roomNumber: '202',
      doctorId: doctor1._id,
      assignedDoctorId: doctor1._id,
      assignedDoctorName: doctor1.name,
      department: 'Cardiologist',
      diagnosis: 'Acute Myocardial Infarction (Heart Attack) - STEMI',
      prescription: 'Aspirin 81mg daily, Clopidogrel 75mg daily, Atorvastatin 80mg at bedtime, Metoprolol 50mg twice daily.',
      notes: 'Post-cardiac catheterization. Stent placed in LAD. Cardiac rehab referral made.',
      status: 'active',
      lastCheckup: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    // Surgery Department Patients (Surgeon - Dr. Michael Chen)
    const patient3 = await PatientRecord.create({
      patientName: 'Robert Brown',
      patientAge: 48,
      roomNumber: '301',
      doctorId: doctor2._id,
      assignedDoctorId: doctor2._id,
      assignedDoctorName: doctor2.name,
      department: 'Surgeon',
      diagnosis: 'Acute Appendicitis - Post-operative laparoscopic appendectomy',
      prescription: 'Cefazolin 1g IV every 8 hours, Acetaminophen 650mg every 6 hours PRN pain.',
      notes: 'Post-op day 1. Wound healing well. No signs of infection. NPO until bowel sounds return.',
      status: 'active',
      lastCheckup: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    const patient4 = await PatientRecord.create({
      patientName: 'Lisa Martinez',
      patientAge: 34,
      roomNumber: '302',
      doctorId: doctor2._id,
      assignedDoctorId: doctor2._id,
      assignedDoctorName: doctor2.name,
      department: 'Surgeon',
      diagnosis: 'Cholecystitis with cholelithiasis - Scheduled for cholecystectomy',
      prescription: 'NPO after midnight, IV fluids normal saline at 125mL/hr, Ondansetron 4mg IV PRN nausea.',
      notes: 'Pre-op labs completed. Surgery scheduled for tomorrow AM. Patient consented and anxious.',
      status: 'active',
      lastCheckup: new Date()
    });

    console.log(`✅ Created ${await PatientRecord.countDocuments()} patient records across 2 departments`);

    // Create medication schedules for today
    console.log('💊 Creating medication schedules...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Medications for John Smith (Cardiology)
    await MedicationSchedule.create({
      patientName: 'John Smith',
      patientRecordId: patient1._id,
      medication: 'Furosemide',
      dosage: '40mg',
      scheduledTime: '09:00 AM',
      nurseId: nurse._id,
      administered: true,
      date: today,
      administeredAt: new Date()
    });

    await MedicationSchedule.create({
      patientName: 'John Smith',
      patientRecordId: patient1._id,
      medication: 'Carvedilol',
      dosage: '12.5mg',
      scheduledTime: '08:00 AM',
      nurseId: nurse._id,
      administered: true,
      date: today,
      administeredAt: new Date()
    });

    await MedicationSchedule.create({
      patientName: 'John Smith',
      patientRecordId: patient1._id,
      medication: 'Carvedilol',
      dosage: '12.5mg',
      scheduledTime: '08:00 PM',
      administered: false,
      date: today
    });

    // Medications for Mary Johnson (Cardiology)
    await MedicationSchedule.create({
      patientName: 'Mary Johnson',
      patientRecordId: patient2._id,
      medication: 'Aspirin',
      dosage: '81mg',
      scheduledTime: '08:00 AM',
      nurseId: nurse._id,
      administered: true,
      date: today,
      administeredAt: new Date()
    });

    await MedicationSchedule.create({
      patientName: 'Mary Johnson',
      patientRecordId: patient2._id,
      medication: 'Clopidogrel',
      dosage: '75mg',
      scheduledTime: '08:00 AM',
      nurseId: nurse._id,
      administered: true,
      date: today,
      administeredAt: new Date()
    });

    await MedicationSchedule.create({
      patientName: 'Mary Johnson',
      patientRecordId: patient2._id,
      medication: 'Atorvastatin',
      dosage: '80mg',
      scheduledTime: '10:00 PM',
      administered: false,
      date: today
    });

    // Medications for Robert Brown (Surgery)
    await MedicationSchedule.create({
      patientName: 'Robert Brown',
      patientRecordId: patient3._id,
      medication: 'Cefazolin',
      dosage: '1g IV',
      scheduledTime: '06:00 AM',
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
      scheduledTime: '12:00 PM',
      administered: false,
      date: today
    });

    // Medications for Lisa Martinez (Surgery)
    await MedicationSchedule.create({
      patientName: 'Lisa Martinez',
      patientRecordId: patient4._id,
      medication: 'Ondansetron',
      dosage: '4mg IV',
      scheduledTime: '10:00 AM',
      administered: false,
      date: today
    });

    console.log(`✅ Created ${await MedicationSchedule.countDocuments()} medication schedules`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('--------------------------------');
    console.log('Doctor (Cardiologist):');
    console.log('  Email: doctor1@hospital.com');
    console.log('  Password: doctor123');
    console.log('\nDoctor (Surgeon):');
    console.log('  Email: doctor2@hospital.com');
    console.log('  Password: doctor123');
    console.log('\nNurse:');
    console.log('  Email: nurse1@hospital.com');
    console.log('  Password: nurse123');
    console.log('\nAdmin:');
    console.log('  Email: admin@hospital.com');
    console.log('  Password: admin123');
    console.log('--------------------------------');
    console.log('\n👥 Patients by Department:');
    console.log('  Cardiologist: John Smith, Mary Johnson');
    console.log('  Surgeon: Robert Brown, Lisa Martinez');
    console.log('--------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
