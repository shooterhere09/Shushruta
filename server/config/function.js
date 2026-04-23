/* This all of are helper function */
const userModel = require("../models/users");

exports.toTitleCase = function (str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

exports.validateEmail = function (mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  } else {
    return false;
  }
};

exports.emailCheckInDatabase = async function (email) {
  let user = await userModel.findOne({ email: email });
  user.exec((err, data) => {
    if (!data) {
      return false;
    } else {
      return true;
    }
  });
};

exports.phoneNumberCheckInDatabase = async function (phoneNumber) {
  let user = await userModel.findOne({ phoneNumber: phoneNumber });
  user.exec((err, data) => {
    if (data) {
      return true;
    } else {
      return false;
    }
  });
};

// -----------------------------
// OTP / SMS helper
// -----------------------------
// Usage:
//  const { sendSmsToUser } = require('../config/function');
//  const res = await sendSmsToUser(uId, optionalPhoneNumberString);
// In server/.env set the following to enable Twilio SMS sending:
// TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// TWILIO_AUTH_TOKEN=your_auth_token_here
// TWILIO_FROM=+12345678901
// For local dev (NODE_ENV !== 'production') the function will return the OTP in the response
// to allow manual testing without Twilio.

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const { parsePhoneNumberFromString, AsYouType } = require('libphonenumber-js');

function normalizePhone(phone) {
  if (!phone && phone !== 0) return "";
  const raw = phone.toString().trim();

  // Try parse directly (accepts +country formats)
  let parsed = parsePhoneNumberFromString(raw);
  if (parsed && parsed.isValid && parsed.number) {
    return parsed.number; // E.164
  }

  // If parsing failed, try assuming India (IN) for 10-digit numbers
  const digitsOnly = raw.replace(/[^0-9]/g, "");
  if (digitsOnly.length === 10) {
    parsed = parsePhoneNumberFromString(digitsOnly, 'IN');
    if (parsed && parsed.isValid && parsed.number) return parsed.number;
  }

  // As a last resort, try AsYouType formatting and then parse
  try {
    const formatted = new AsYouType().input(raw);
    parsed = parsePhoneNumberFromString(formatted);
    if (parsed && parsed.isValid && parsed.number) return parsed.number;
  } catch (e) {
    // ignore
  }

  // Return raw digits if we couldn't parse; Twilio will likely reject and we'll show a clear error
  return digitsOnly;
}

exports.sendSmsToUser = async function sendSmsToUser(uId, number) {
  if (!uId) return { error: "uId required" };

  let otp; // Declare OTP outside the try block

  try {
    const user = await userModel.findById(uId);
    if (!user) return { error: "User not found" };

    const phone = number ? number.toString() : (user.phoneNumber ? user.phoneNumber.toString() : "");
    if (!phone) return { error: "User has no phone number" };

    const phoneNorm = normalizePhone(phone);
    console.log("Normalized Phone Number:", phoneNorm);

    const digitCount = phoneNorm.replace(/[^0-9]/g, "").length;
    if (digitCount < 7) return { error: "User phone number appears invalid" };

    otp = generateOtp(); // Assign OTP here
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP on user record
    user.otpCode = otp; // consider hashing in production
    user.otpExpires = expires;
    user.phoneNumber = phone; // ensure DB has the phone we used
    user.phoneVerified = false; // reset verification when sending a new OTP
    await user.save();

    const messageBody = `Your verification code is ${otp}. It will expire in 5 minutes.`;

    // Debug environment variables
    console.log("Environment Variables Check:");
    console.log("TWILIO_ACCOUNT_SID exists:", !!process.env.TWILIO_ACCOUNT_SID);
    console.log("TWILIO_AUTH_TOKEN exists:", !!process.env.TWILIO_AUTH_TOKEN);
    console.log("TWILIO_FROM exists:", !!process.env.TWILIO_FROM);
    
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) {
      try {
        console.log("Twilio Credentials:", {
          accountSid: `${process.env.TWILIO_ACCOUNT_SID.substring(0, 5)}...`,
          authToken: `${process.env.TWILIO_AUTH_TOKEN.substring(0, 5)}...`,
          from: process.env.TWILIO_FROM
        });

        const Twilio = require("twilio");
        const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const response = await client.messages.create({
          body: messageBody,
          from: process.env.TWILIO_FROM,
          to: phoneNorm,
        });

        console.log("Twilio Response:", response);
        return { success: "OTP sent via Twilio" };
      } catch (twilioError) {
        console.error("Twilio Error:", twilioError);
        return { error: "Failed to send OTP via Twilio" };
      }
    } else {
      console.warn("Twilio credentials are missing in environment variables.");
      // Dev fallback: return OTP so developer can test without Twilio
      if (process.env.NODE_ENV !== "production") {
        return { success: true, otp }; // Use the OTP variable here
      }
      return { error: "Twilio credentials are not configured" };
    }
  } catch (err) {
    console.error("sendSmsToUser Error:", err);
    return { error: "Server error" };
  }
};

// Removed extra closing brace
