import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { assertCloudinaryConfigured } from "./config/cloudinary.js";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();
    const cloudName = await assertCloudinaryConfigured();
    if (process.env.NODE_ENV !== "production") {
      console.log(`Cloudinary configured for cloud: ${cloudName}`);
    }
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
