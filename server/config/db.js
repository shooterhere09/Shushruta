const mongoose = require("mongoose");
require("dotenv").config();

try {
  mongoose.connect(process.env.DATABASE || "mongodb://127.0.0.1:27017/Shushruta", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false
  });
  console.log("Database Connected Successfully");
} catch (err) {
  console.log("Database Not Connected:", err.message);
}
