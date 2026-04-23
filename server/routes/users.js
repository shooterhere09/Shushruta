const express = require("express");
const router = express.Router();
const usersController = require("../controller/users");

router.get("/all-user", usersController.getAllUser);
router.post("/single-user", usersController.getSingleUser);
router.post("/user-by-hospitalid", usersController.getUserByHospitalId);

router.post("/add-user", usersController.postAddUser);
router.post("/edit-user", usersController.postEditUser);
router.post("/delete-user", usersController.getDeleteUser);

router.post("/change-password", usersController.changePassword);

router.post("/send-otp", usersController.sendOtp);
router.post("/verify-otp", usersController.verifyOtp);

router.post("/forgot-password", usersController.forgotPassword);
router.post("/reset-password", usersController.resetPassword);
router.post("/verify-reset-token", usersController.verifyResetToken);

router.post("/upload-documents", usersController.uploadDocuments);

module.exports = router;
