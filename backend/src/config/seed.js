const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Notice = require('../models/Notice');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Attendance.deleteMany();
    await Assignment.deleteMany();
    await Submission.deleteMany();
    await Notice.deleteMany();
    console.log('Cleared existing collections.');

    // 1. Create Teachers
    const smith = await User.create({
      name: 'Dr. Alan Smith',
      email: 'smith@teacher.com',
      password: 'password123',
      role: 'teacher',
      subject: 'Computer Science'
    });

    const jones = await User.create({
      name: 'Prof. Mary Jones',
      email: 'jones@teacher.com',
      password: 'password123',
      role: 'teacher',
      subject: 'Mathematics'
    });

    console.log('Teachers seeded.');

    // 2. Create Students
    const students = await User.create([
      {
        name: 'John Doe',
        email: 'john@student.com',
        password: 'password123',
        role: 'student',
        rollNumber: 'CS-101',
        addedBy: smith._id
      },
      {
        name: 'Jane Doe',
        email: 'jane@student.com',
        password: 'password123',
        role: 'student',
        rollNumber: 'CS-102',
        addedBy: smith._id
      },
      {
        name: 'Bob Johnson',
        email: 'bob@student.com',
        password: 'password123',
        role: 'student',
        rollNumber: 'CS-103',
        addedBy: jones._id
      },
      {
        name: 'Alice Williams',
        email: 'alice@student.com',
        password: 'password123',
        role: 'student',
        rollNumber: 'CS-104',
        addedBy: jones._id
      }
    ]);

    console.log('Students seeded.');

    // 3. Create mock Attendance records (to show percentages and analytics)
    const dates = [];
    for (let i = 10; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      dates.push(d);
    }

    const attendanceRecords = [];

    // Computer Science attendance logs (smith)
    // John: 9/10 present (90%)
    // Jane: 6/10 present (60% - Low Attendance!)
    // Bob: 8/10 present (80%)
    // Alice: 4/10 present (40% - Low Attendance!)
    const statuses = {
      'John Doe': [true, true, true, true, false, true, true, true, true, true],
      'Jane Doe': [true, false, true, false, true, false, true, false, true, true],
      'Bob Johnson': [true, true, true, true, true, false, false, true, true, true],
      'Alice Williams': [false, false, true, false, true, false, true, false, false, true]
    };

    students.forEach(student => {
      const pStatuses = statuses[student.name];
      dates.forEach((date, index) => {
        attendanceRecords.push({
          student: student._id,
          teacher: smith._id,
          subject: 'Computer Science',
          date: date,
          status: pStatuses[index] ? 'Present' : 'Absent'
        });
      });
    });

    // Mathematics attendance logs (jones)
    // Seed some math attendance logs for Bob & Alice
    dates.slice(0, 5).forEach((date, index) => {
      attendanceRecords.push({
        student: students[2]._id, // Bob
        teacher: jones._id,
        subject: 'Mathematics',
        date: date,
        status: index % 2 === 0 ? 'Present' : 'Absent'
      });
      attendanceRecords.push({
        student: students[3]._id, // Alice
        teacher: jones._id,
        subject: 'Mathematics',
        date: date,
        status: 'Present'
      });
    });

    await Attendance.insertMany(attendanceRecords);
    console.log('Attendance records seeded.');

    // 4. Create assignments
    const csAssignment1 = await Assignment.create({
      title: 'Intro to React Hooks',
      description: 'Implement a custom hook that manages window dimensions on resize events. Write clean code and submit as a PDF or JS file.',
      subject: 'Computer Science',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      notes: 'Please write tests for bonus points.',
      teacher: smith._id
    });

    const csAssignment2 = await Assignment.create({
      title: 'Database Schema Design',
      description: 'Design a Mongoose schema for a blogging platform with users, posts, categories and comments. Create a PDF diagram.',
      subject: 'Computer Science',
      deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (Closed/Late)
      notes: 'Late submissions will be graded with a 20% penalty.',
      teacher: smith._id
    });

    const mathAssignment = await Assignment.create({
      title: 'Linear Algebra Problem Set 1',
      description: 'Solve problems 1-10 on page 45 regarding matrix multiplication and inverse systems.',
      subject: 'Mathematics',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      notes: 'Show all intermediate computation steps.',
      teacher: jones._id
    });

    console.log('Assignments seeded.');

    // 5. Seed Submissions
    // Submit CS assignment 2 for John Doe (on time)
    await Submission.create({
      assignment: csAssignment2._id,
      student: students[0]._id, // John
      filePath: '/uploads/dummy_schema.pdf',
      fileName: 'dummy_schema.pdf',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Submitted before deadline
      status: 'Submitted'
    });

    // Submit CS assignment 2 for Jane Doe (Late submission)
    await Submission.create({
      assignment: csAssignment2._id,
      student: students[1]._id, // Jane
      filePath: '/uploads/jane_db_design.pdf',
      fileName: 'jane_db_design.pdf',
      submittedAt: new Date(), // Submitted after deadline (since deadline was 1 day ago)
      status: 'Late'
    });

    console.log('Submissions seeded.');

    // 6. Seed Notice
    const csNotice = await Notice.create({
      title: 'Upcoming Midterm Exam',
      content: 'The CS midterm exam will cover basic JS logic, asynchronous functions, Express API design, and MongoDB schemas. It is scheduled for next Friday at 10:00 AM.',
      subject: 'Computer Science',
      teacher: smith._id,
      comments: [
        {
          user: students[0]._id, // John
          text: 'Doctor Smith, will there be coding questions or multiple-choice questions?',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
          user: smith._id, // Teacher response
          text: 'It will be 40% conceptual multiple-choice and 60% coding questions.',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
        }
      ]
    });

    console.log('Notices seeded.');

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
