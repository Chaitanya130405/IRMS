import "dotenv/config";
import fs from "fs";
import app from "./app.js";
import { connectDB } from "./config/db.js";
fs.mkdirSync("src/uploads", { recursive: true });
connectDB()
  .then(() =>
    app.listen(process.env.PORT || 5000, () =>
      console.log(`API on ${process.env.PORT || 5000}`),
    ),
  )
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
