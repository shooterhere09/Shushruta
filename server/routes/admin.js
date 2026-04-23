const express = require("express");
const router = express.Router();
const { loginCheck, isAuth, isAdmin } = require("../middleware/auth");
const adminController = require("../controller/admin");

// Protected admin document upload endpoint
router.post(
  "/upload-documents",
  loginCheck,
  isAuth,
  isAdmin,
  adminController.uploadDocuments
);

module.exports = router;