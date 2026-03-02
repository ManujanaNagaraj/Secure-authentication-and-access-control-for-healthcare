import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import PatientRecord from './models/PatientRecord.js';

dotenv.config();

// Sample patient data
const firstNames = ['John', 'Emma', 'Michael', 'Olivia', 'William', 'Sophia', 'James', 'Isabella', 'Robert', 'Mia', 'David', 'Charlotte', 'Joseph', 'Amelia', 'Charles', 'Harper', 'Thomas', 'Evelyn', 'Daniel', 'Abigail'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Emergency', 'Surgery', 'ICU'];

const diagnoses = [
  'Hypertension', 'Type 2 Diabetes', 'Asthma', 'Pneumonia', 'Bronchitis',
  'Migraine', 'Arthritis', 'Back Pain', 'Fracture', 'Appendicitis',
  'Gastritis', 'Common Cold', 'Influenza', 'Urinary Tract Infection',
  'Allergic Reaction', 'Chest Pain', 'Abdominal Pain', 'Fever',
  'Coronary Artery Disease', 'Chronic Kidney Disease'
];

const prescriptions = [
  'Paracetamol 500mg - Take 1 tablet twice daily',
  'Amoxicillin 500mg - Take 1 capsule three times daily for 7 days',
  'Ibuprofen 400mg - Take 1 tablet as needed for pain',
  'Metformin 500mg - Take 1 tablet twice daily with meals',
  'Lisinopril 10mg - Take 1 tablet once daily',
  'Aspirin 75mg - Take 1 tablet once daily',
  'Omeprazole 20mg - Take 1 capsule once daily before breakfast',
  'Salbutamol Inhaler - 2 puffs as needed for breathing difficulty',
  'Atorvastatin 20mg - Take 1 tablet once daily at bedtime',
  'Amlodipine 5mg - Take 1 tablet once daily'
];

const notes = [
  'Patient responding well to treatment',
  'Monitor blood pressure daily',
  'Follow-up after 1 week',
  'Patient advised rest and hydration',
  'Vital signs stable',
  'Continue current medication',
  'Patient showing improvement',
  'Scheduled for follow-up tests',
  'Family history of diabetes noted',
  'Patient advised dietary changes',
  'Regular exercise recommended',
  'No complications observed',
  ''
];

const statuses = ['active', 'active', 'active', 'discharged'];

// Generate random patient record
const generatePatient = (doctor, index) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const age = Math.floor(Math.random() * 80) + 1; // 1-80 years
  const floor = Math.floor(Math.random() * 5) + 1; // 1-5 floors
  const roomNum = Math.floor(Math.random() * 20) + 1; // 1-20 rooms
  const roomNumber = `${floor}${String(roomNum).padStart(2, '0')}`;
  
  const department = departments[Math.floor(Math.random() * departments.length)];
  const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
  const prescription = prescriptions[Math.floor(Math.random() * prescriptions.length)];
  const note = notes[Math.floor(Math.random() * notes.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  // Random date within last 30 days
  const daysAgo = Math.floor(Math.random() * 30);
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - daysAgo);
  
  const lastCheckup = new Date(createdAt);
  lastCheckup.setDate(lastCheckup.getDate() + Math.floor(Math.random() * daysAgo));
  
  return {
    patientName: `${firstName} ${lastName}`,
    patientAge: age,
    roomNumber: roomNumber,
    doctorId: doctor._id,
    assignedDoctorId: doctor._id,
    assignedDoctorName: doctor.name,
    department: department,
    diagnosis: diagnosis,
    prescription: prescription,
    notes: note,
    status: status,
    createdAt: createdAt,
    lastCheckup: lastCheckup
  };
};

const seedPatientRecords = async () => {
  try {
    console.log('🌱 Starting patient records seeding...');

    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get all doctors and nurses
    const doctors = await User.find({ role: 'doctor' });
    const nurses = await User.find({ role: 'nurse' });
    
    console.log(`📋 Found ${doctors.length} doctors and ${nurses.length} nurses`);

    if (doctors.length === 0 && nurses.length === 0) {
      console.log('⚠️  No doctors or nurses found. Please seed users first.');
      process.exit(0);
    }

    // Clear existing patient records
    await PatientRecord.deleteMany({});
    console.log('🗑️  Cleared existing patient records');

    const allStaff = [...doctors, ...nurses];
    let totalRecords = 0;

    // Create 20 patient records for each doctor/nurse
    for (const staff of allStaff) {
      const patients = [];
      for (let i = 0; i < 20; i++) {
        patients.push(generatePatient(staff, i));
      }
      
      await PatientRecord.insertMany(patients);
      totalRecords += patients.length;
      console.log(`✅ Created 20 patient records for ${staff.role} ${staff.name}`);
    }

    console.log(`\n🎉 Successfully created ${totalRecords} patient records!`);
    console.log(`   - ${doctors.length} doctors × 20 = ${doctors.length * 20} records`);
    console.log(`   - ${nurses.length} nurses × 20 = ${nurses.length * 20} records`);
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error seeding patient records:', error.message);
    process.exit(1);
  }
};

seedPatientRecords();
