import React, { Fragment, useState } from "react";
import axios from "axios";

const ForgotPassword = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const apiURL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter your email address");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`${apiURL}/api/user/forgot-password`, { email });
      if (res.data.success) {
        setMessage(res.data.success);
        setMessageType("success");
        setEmail("");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(res.data.error || "Failed to send reset email");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <div className="w-full">
        <h2 className="text-lg font-semibold mb-4">Forgot Password?</h2>
        <p className="text-sm text-gray-600 mb-4">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="email">
              Email address<span className="text-sm text-gray-600 ml-1">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="border px-4 py-2 focus:outline-none"
            />
          </div>

          {message && (
            <div
              className={`px-4 py-2 rounded text-sm ${
                messageType === "success"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              style={{ background: "#303031" }}
              className="flex-1 font-medium px-4 py-2 text-white text-center cursor-pointer disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 font-medium px-4 py-2 border border-gray-300 text-center cursor-pointer hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Fragment>
  );
};

export default ForgotPassword;

