const mongoose = require('mongoose');
const User = require('./src/models/User');

const MONGODB_URI = "mongodb+srv://railwayuser:attend123@cluster0.gtt7pkr.mongodb.net/attendwise?retryWrites=true&w=majority&appName=Cluster0";

const resetPassword = async () => {
  try {
    console.log("Connecting to production database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    // Find the user by name (case-insensitive)
    const user = await User.findOne({ name: /sai rakesh/i });

    if (user) {
      user.password = "password123";
      await user.save();
      console.log(`-----------------------------------------------`);
      console.log(`Success! Password has been reset for account:`);
      console.log(`Name: ${user.name}`);
      console.log(`Email/Login ID: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`New Password: password123`);
      console.log(`-----------------------------------------------`);
    } else {
      console.log("Error: No account with the name 'sai rakesh' was found in the database.");
      
      // Let's print out all users in the database to help see what email/name was registered
      const allUsers = await User.find({}, 'name email role');
      console.log("\nRegistered accounts in your database:");
      allUsers.forEach(u => {
        console.log(`- Name: "${u.name}", Email: "${u.email}", Role: "${u.role}"`);
      });
    }
  } catch (error) {
    console.error("Error connecting or resetting password:", error.message);
  } finally {
    mongoose.disconnect();
  }
};

resetPassword();
