import mongoose from "mongoose";

export const connectDB = async () => {
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected");

      // Handle connection events after initial connection
      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err.message);
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected. Attempting to reconnect...");
      });

      mongoose.connection.on("reconnected", () => {
        console.log("MongoDB reconnected");
      });

      return;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${attempt}/${maxRetries} failed:`,
        error.message
      );

      if (attempt === maxRetries) {
        console.error("Max retries reached. Could not connect to MongoDB.");
        throw error;
      }

      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};
