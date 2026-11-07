import mongoose from "mongoose";

// Test database URI - use a separate test database
const TEST_DB_URI =
  process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27017/irms_test";

export const connectTestDB = async () => {
  await mongoose.connect(TEST_DB_URI);
};

export const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
