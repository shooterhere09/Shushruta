
const path = require("path");
const express = require("express");
const app = express();
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// Set global mongoose options to avoid deprecation warnings


// Import Router
const authRouter = require("./routes/auth");
const categoryRouter = require("./routes/categories");
const productRouter = require("./routes/products");
// TEMP DISABLED PAYMENT: Braintree router import
// const brainTreeRouter = require("./routes/braintree");
const orderRouter = require("./routes/orders");
const usersRouter = require("./routes/users");
const customizeRouter = require("./routes/customize");
const mailRouter = require("./routes/mail");
const similarityRouter = require("./routes/similarity");
const adminRouter = require("./routes/admin");
// Import Auth middleware for check user login or not~
const { loginCheck } = require("./middleware/auth");
const CreateAllFolder = require("./config/uploadFolderCreateScript");
/* Create All Uploads Folder if not exists | For Uploading Images */
CreateAllFolder();
// Database Connection
mongoose
  .connect(process.env.DATABASE || "mongodb+srv://itsofficialomkar:omkar12345@omkar.pemsh.mongodb.net/myDatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    bufferCommands: false // Disable mongoose command buffering
  })
  .then(() =>
    console.log(
      "==============Mongodb Database Connected Successfully=============="
    )
  )
  .catch((err) => {
    console.log("Database Connection Error:", err.message);
    console.log("Trying to connect to:", process.env.DATABASE || "mongodb+srv://itsofficialomkar:omkar12345@omkar.pemsh.mongodb.net/myDatabase?retryWrites=true&w=majority");
  });

// Middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/api", authRouter);
app.use("/api/user", usersRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
// TEMP DISABLED PAYMENT: Disable Braintree routes
// app.use("/api", brainTreeRouter);
app.use("/api/order", orderRouter);
app.use("/api/customize", customizeRouter);
app.use('/api/mail', mailRouter);

app.use("/api/admin", adminRouter);
app.use("/api/similarity", similarityRouter);

// Run Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Server is running on ", PORT);
});
