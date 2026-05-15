// Simple test script to verify notification creation
const mongoose = require('mongoose');
const { createNotification } = require('./controllers/notificationController');

// Mock user object for testing
const mockUser = {
  _id: '507f1f77bcf86cd799439011', // Mock ObjectId
  fullName: 'Test User'
};

async function testNotificationCreation() {
  try {
    // Connect to MongoDB (you may need to update the connection string)
    await mongoose.connect('mongodb://localhost:27017/farmershub_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Create a test notification
    const notification = await createNotification(
      mockUser._id,
      'system',
      'Test Notification',
      'This is a test notification to verify the system works.',
      null,
      null
    );

    console.log('Test notification created:', notification);

    // Clean up
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testNotificationCreation();