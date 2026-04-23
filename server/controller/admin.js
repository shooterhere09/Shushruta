const cloudinary = require("cloudinary").v2;
const userModel = require("../models/users");
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadDocuments = async (req, res) => {

  try {
    // Check if files are present in the request
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const uploadedFiles = {};
    const loggedInUserId = req.body.loggedInUserId; // Assuming loggedInUserId is sent in req.body

    if (!loggedInUserId) {
      return res.status(400).json({ error: "Hospital ID not provided." });
    }

    const folderPath = `shushruta/hospital_documents/${loggedInUserId}`;

    for (const key in req.files) {
      const file = req.files[key];
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: folderPath, // Dynamic folder based on hospital ID
      });
      uploadedFiles[key] = result.secure_url;
    }

    res.status(200).json({ message: "Files uploaded successfully", urls: uploadedFiles });

            // Update user document with upload status
            const updateFields = {};
            if (uploadedFiles.hospitalLicense) {
              updateFields.hospitalLicenseUploaded = true;
            }
            if (uploadedFiles.registrationCertificate) {
              updateFields.registrationCertificateUploaded = true;
            }
            if (uploadedFiles.proofOfOwnership) {
              updateFields.proofOfOwnershipUploaded = true;
            }

            if (Object.keys(updateFields).length > 0) {
              await userModel.findByIdAndUpdate(loggedInUserId, { $set: updateFields });
            }
  } catch (error) {

    res.status(500).json({ error: "Internal server error during upload." });
  }
};