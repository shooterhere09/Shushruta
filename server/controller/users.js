const userModel = require("../models/users");
const { geocodeAddress } = require("../config/nominatim");
const bcrypt = require("bcryptjs");
const { sendSmsToUser } = require("../config/function");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// utilities not required
// Twilio will be used if env credentials are provided
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    const Twilio = require("twilio");
    twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (err) {
    console.log("Twilio not installed or failed to initialize:", err.message);
  }
}

class User {
  async getAllUser(req, res) {
    try {
      let Users = await userModel
        .find({})
        .populate("allProduct.id", "pName pImages")
        .populate("user", "name email")
        .sort({ _id: -1 });
      if (Users) {
        return res.json({ Users });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getSingleUser(req, res) {
    let { uId } = req.body;
    if (!uId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let User = await userModel
          .findById(uId)
          .select("name email phoneNumber phoneVerified userImage updatedAt createdAt address hospitalId hospitalInfo aadharCardUploaded medicalReportUploaded");
        if (User) {
                return res.json({ User });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getUserByHospitalId(req, res) {
    let { hospitalId } = req.body;
    if (!hospitalId) {
      return res.json({ error: "Hospital ID must be provided" });
    } else {
      try {
        let User = await userModel
          .findOne({ hospitalId: hospitalId })
          .select("name email phoneNumber phoneVerified userImage updatedAt createdAt address hospitalId hospitalInfo");
        if (User) {
          return res.json({ User });
        }
      } catch (err) {
        console.log(err);
        return res.json({ error: "Server error" });
      }
    }
  }

  async postAddUser(req, res) {
    let { uId } = req.body;
    if (!uId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let User = await userModel
          .findById(uId)
          .select("name email phoneNumber phoneVerified userImage updatedAt createdAt address hospitalId");
        if (User) {
          return res.json({ User });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async postAddUser(req, res) {
    let { allProduct, user, amount, transactionId, phone } = req.body;
    if (
      !allProduct ||
      !user ||
      !amount ||
      !transactionId ||
      !address ||
      !phone
    ) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        let newUser = new userModel({
          allProduct,
          user,
          amount,
          transactionId,
          address,
          phone,
        });
        let save = await newUser.save();
        if (save) {
          return res.json({ success: "User created successfully" });
        }
      } catch (err) {
        return res.json({ error: error });
      }
    }
  }

  async postEditUser(req, res) {
    let { uId, name, phoneNumber, street, city, state, postcode, country, latitude, longitude, hospitalId, hospitalInfo } = req.body;
    if (!uId || !name || !phoneNumber) {
      return res.json({ message: "All filled must be required" });
    } else {
      // Fetch existing user to detect phone number change
      try {
        const existing = await userModel.findById(uId);
            if (!existing) return res.json({ error: "User not found" });

            let geoCoordinates = { latitude: null, longitude: null };
            if (street && city && state && postcode && country) {
                try {
                    geoCoordinates = await geocodeAddress(street, city, state, postcode, country);
                    if (!geoCoordinates) {
                        console.log("Geocoding failed for address:", { street, city, state, postcode, country });
                        // Optionally, you can return an error to the client or proceed without coordinates
                    }
                } catch (geoErr) {
                    console.error("Error during geocoding:", geoErr);
                    // Optionally, you can return an error to the client or proceed without coordinates
                }
            }

            const updates = {
                name: name,
                phoneNumber: phoneNumber,
                updatedAt: Date.now(),
                address: {
                    street: street,
                    city: city,
                    state: state,
                    postcode: postcode,
                    country: country,
                    latitude: latitude || geoCoordinates.latitude,
                    longitude: longitude || geoCoordinates.longitude,
                },
                hospitalId: hospitalId, // Add hospitalId to updates
            };

            // Add hospitalInfo to updates if provided
            if (hospitalInfo) {
              updates.hospitalInfo = {
                name: hospitalInfo.name || "",
                street: hospitalInfo.street || "",
                city: hospitalInfo.city || "",
                state: hospitalInfo.state || "",
                postcode: hospitalInfo.postcode || "",
                country: hospitalInfo.country || "",
                latitude: hospitalInfo.latitude || null,
                longitude: hospitalInfo.longitude || null,
              };
            }

        // Check if phone number is being changed
        const oldPhone = existing.phoneNumber ? existing.phoneNumber.toString() : "";
        const newPhone = phoneNumber ? phoneNumber.toString() : "";

        if (oldPhone !== newPhone) {
          // Prevent phone number change if already verified
          if (existing.phoneVerified) {
            return res.json({ error: "Cannot change phone number once verified. Please contact support if you need to update your phone number." });
          }
          // If phone number changed and not verified, reset verification fields
          updates.phoneVerified = false;
          updates.otpCode = null;
          updates.otpExpires = null;
        }

        await userModel.findByIdAndUpdate(uId, updates);
        return res.json({ success: "User updated successfully" });
      } catch (err) {
        console.log(err);
        return res.json({ error: "Server error" });
      }
    }
  }

  async getDeleteUser(req, res) {
    let { oId, status } = req.body;
    if (!oId || !status) {
      return res.json({ message: "All filled must be required" });
    } else {
      let currentUser = userModel.findByIdAndUpdate(oId, {
        status: status,
        updatedAt: Date.now(),
      });
      currentUser.exec((err, result) => {
        if (err) console.log(err);
        return res.json({ success: "User updated successfully" });
      });
    }
  }

  async changePassword(req, res) {
    let { uId, oldPassword, newPassword } = req.body;
    if (!uId || !oldPassword || !newPassword) {
      return res.json({ message: "All filled must be required" });
    } else {
      const data = await userModel.findOne({ _id: uId });
      if (!data) {
        return res.json({
          error: "Invalid user",
        });
      } else {
        const oldPassCheck = await bcrypt.compare(oldPassword, data.password);
        if (oldPassCheck) {
          newPassword = bcrypt.hashSync(newPassword, 10);
          let passChange = userModel.findByIdAndUpdate(uId, {
            password: newPassword,
          });
          passChange.exec((err, result) => {
            if (err) console.log(err);
            return res.json({ success: "Password updated successfully" });
          });
        } else {
          return res.json({
            error: "Your old password is wrong!!",
          });
        }
      }
    }
  }

  // Send OTP to user's phone number
  async sendOtp(req, res) {
    const { uId } = req.body;
    if (!uId) return res.json({ error: "uId required" });
    try {
      const user = await userModel.findById(uId);
      if (!user) return res.json({ error: "User not found" });
      if (!user.phoneNumber) return res.json({ error: "User has no phone number" });

      // Basic phone validation: ensure it's string/number and looks like E.164 (starts with + and digits) or local digits
      const phoneStr = user.phoneNumber ? user.phoneNumber.toString() : "";
      // very simple check: at least 7 digits, optionally starting with +
      const phoneDigits = phoneStr.replace(/[^0-9]/g, "");
      if (phoneDigits.length < 7) {
        return res.json({ error: "User phone number appears invalid" });
      }

      // Delegate OTP generation, normalization and sending to helper which handles E.164 formatting
      const sendResult = await sendSmsToUser(uId, phoneStr);
      if (sendResult && sendResult.success) {
        // In dev the helper may also return the otp for testing
        if (sendResult.otp) return res.json({ success: "OTP generated (dev)", otp: sendResult.otp });
        return res.json({ success: "OTP sent via Twilio" });
      }
      // sendResult likely contains { error: '...' }
      const message = sendResult && sendResult.error ? sendResult.error : "Failed to send OTP";
      return res.json({ error: message });
    } catch (err) {
      console.log(err);
      return res.json({ error: "Server error" });
    }
  }

  // Verify OTP
  async verifyOtp(req, res) {
    const { uId, otp } = req.body;
    if (!uId || !otp) return res.json({ error: "uId and otp required" });
    try {
      const user = await userModel.findById(uId);
      if (!user) return res.json({ error: "User not found" });
      if (!user.otpCode || !user.otpExpires) return res.json({ error: "No OTP requested" });

      if (new Date() > user.otpExpires) {
        return res.json({ error: "OTP expired" });
      }
      if (user.otpCode !== otp.toString()) {
        return res.json({ error: "Invalid OTP" });
      }

      user.phoneVerified = true;
      user.otpCode = null;
      user.otpExpires = null;
      await user.save();
      return res.json({ success: "Phone number verified" });
    } catch (err) {
      console.log(err);
      return res.json({ error: "Server error" });
    }
  }

  // Forgot Password - Send reset link to email
  async forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) return res.json({ error: "Email is required" });

    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({ success: "If email exists, password reset link has been sent" });
      }

      // Generate a random reset token
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour expiry

      // Save reset token to user
      user.resetToken = resetToken;
      user.resetTokenExpires = resetTokenExpires;
      await user.save();

      // Send email with reset link
      const { sendMail } = require("../config/mailer");
      const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

      const emailBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            .header { background-color: #303031; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
            .content { padding: 20px; }
            .button { display: inline-block; background-color: #303031; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
            .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${user.name},</p>
              <p>We received a request to reset your password. Click the button below to reset it:</p>
              <a href="${resetLink}" class="button">Reset Password</a>
              <p>Or copy and paste this link in your browser:</p>
              <p><small>${resetLink}</small></p>
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.
              </div>
              <p>If you have any questions, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Shushruta Organ Transplant Management System</p>
              <p>&copy; 2024 Shushruta. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await sendMail({
        to: email,
        subject: "Password Reset Request - Shushruta",
        html: emailBody,
      });

      if (result.ok) {
        return res.json({ success: "If email exists, password reset link has been sent" });
      } else {
        return res.json({ error: "Failed to send reset email" });
      }
    } catch (err) {
      console.log(err);
      return res.json({ error: "Server error" });
    }
  }

  // Reset Password - Verify token and update password
  async resetPassword(req, res) {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.json({ error: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.json({ error: "Passwords do not match" });
    }

    try {
      const user = await userModel.findOne({
        resetToken,
        resetTokenExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.json({ error: "Invalid or expired reset token" });
      }

      // Hash new password
      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      // Update user password and clear reset token
      user.password = hashedPassword;
      user.resetToken = null;
      user.resetTokenExpires = null;
      await user.save();

      return res.json({ success: "Password reset successfully. Please login with your new password." });
    } catch (err) {
      console.log(err);
      return res.json({ error: "Server error" });
    }
  }

  // Verify reset token
  async verifyResetToken(req, res) {
    const { resetToken } = req.body;

    if (!resetToken) {
      return res.json({ error: "Reset token is required" });
    }

    try {
      const user = await userModel.findOne({
        resetToken,
        resetTokenExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.json({ error: "Invalid or expired reset token" });
      }

      return res.json({ success: "Token is valid" });
    } catch (err) {
      console.log(err);
      return res.json({ error: "Server error" });
    }
  }

  async uploadDocuments(req, res) {
    try {
      // Check if files are present in the request
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: "No files were uploaded." });
      }

      const uploadedFiles = {};
      const loggedInUserId = req.body.loggedInUserId; // Assuming loggedInUserId is sent in req.body

      if (!loggedInUserId) {
        return res.status(400).json({ error: "User ID not provided." });
      }

      const folderPath = `shushruta/user_documents/${loggedInUserId}`;
      const user = await userModel.findById(loggedInUserId);
      const isPatient = user && user.userType === 'patient'; // Corrected to use 'userType' field

      for (const key in req.files) {
        const file = req.files[key];
        let subfolder = '';

        if (isPatient) {
          if (key === 'aadharCard') {
            subfolder = 'Aadhar';
          } else if (key === 'medicalReport') {
            subfolder = 'MedicalReport';
          }
        }
        
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: `${folderPath}/${subfolder}`, // Dynamic folder based on user ID and subfolder
        });
        uploadedFiles[key] = result.secure_url;
      }

      // Update user document with upload status
      const updateFields = {};
      if (uploadedFiles.aadharCard) {
        updateFields.aadharCardUploaded = true;
      }
      if (uploadedFiles.medicalReport) {
        updateFields.medicalReportUploaded = true;
      }

      if (Object.keys(updateFields).length > 0) {
        await userModel.findByIdAndUpdate(loggedInUserId, { $set: updateFields });
      }

      res.status(200).json({ message: "Files uploaded successfully", urls: uploadedFiles });
    } catch (error) {
      res.status(500).json({ error: "Internal server error during upload." });
    }
  }
}

const ordersController = new User();

// Bind all methods to preserve 'this' context
ordersController.getAllUser = ordersController.getAllUser.bind(ordersController);
ordersController.getSingleUser = ordersController.getSingleUser.bind(ordersController);
ordersController.postAddUser = ordersController.postAddUser.bind(ordersController);
ordersController.postEditUser = ordersController.postEditUser.bind(ordersController);
ordersController.getDeleteUser = ordersController.getDeleteUser.bind(ordersController);
ordersController.changePassword = ordersController.changePassword.bind(ordersController);
ordersController.sendOtp = ordersController.sendOtp.bind(ordersController);
ordersController.verifyOtp = ordersController.verifyOtp.bind(ordersController);
ordersController.forgotPassword = ordersController.forgotPassword.bind(ordersController);
ordersController.resetPassword = ordersController.resetPassword.bind(ordersController);
ordersController.verifyResetToken = ordersController.verifyResetToken.bind(ordersController);
ordersController.uploadDocuments = ordersController.uploadDocuments.bind(ordersController);

module.exports = ordersController;
