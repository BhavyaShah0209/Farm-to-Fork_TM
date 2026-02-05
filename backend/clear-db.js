const mongoose = require('mongoose');
require('dotenv').config();

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Drop all collections
    const collections = await mongoose.connection.db.collections();
    
    for (let collection of collections) {
      await collection.deleteMany({});
      console.log(`✓ Cleared collection: ${collection.collectionName}`);
    }
    
    console.log('\n✅ Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearDatabase();
