const mongoose = require('mongoose');
const User = require('./src/models/User');

// CHANGE THIS to the email of the student you want to delete
const STUDENT_EMAIL_TO_DELETE = "john@student.com"; 

const MONGODB_URI = "mongodb+srv://railwayuser:attend123@cluster0.gtt7pkr.mongodb.net/attendwise?retryWrites=true&w=majority&appName=Cluster0";

const deleteStudent = async () => {
  try {
    console.log("Connecting to production database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    const result = await User.deleteOne({ email: STUDENT_EMAIL_TO_DELETE.toLowerCase().trim(), role: 'student' });

    if (result.deletedCount > 0) {
      console.log(`Successfully deleted student with email: ${STUDENT_EMAIL_TO_DELETE}`);
    } else {
      console.log(`No student found with the email: ${STUDENT_EMAIL_TO_DELETE}`);
    }
  } catch (error) {
    console.error("Error during deletion:", error.message);
  } finally {
    mongoose.disconnect();
  }
};

deleteStudent();
