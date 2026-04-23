import React, { Fragment, useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const params = useParams();
  const resetToken = params?.resetToken;
  const history = useHistory();
  const [state, setState] = useState({
    newPassword: "",
    confirmPassword: "",
    loading: false,
    message: "",
    messageType: "",
    tokenValid: false,
    verifying: true,
    passwordChanged: false,
  });

  const apiURL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await axios.post(`${apiURL}/api/user/verify-reset-token`, {
          resetToken,
        });
        if (res.data.success) {
          setState((prev) => ({
            ...prev,
            tokenValid: true,
            verifying: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            tokenValid: false,
            verifying: false,
            message: res.data.error || "Invalid or expired reset token",
            messageType: "error",
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          tokenValid: false,
          verifying: false,
          message: "Failed to verify token",
          messageType: "error",
        }));
      }
    };

    if (resetToken) {
      verifyToken();
    } else {
      setState((prev) => ({
        ...prev,
        tokenValid: false,
        verifying: false,
        message: "No reset token provided",
        messageType: "error",
      }));
    }
  }, [resetToken, apiURL]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!state.newPassword || !state.confirmPassword) {
      setState((prev) => ({
        ...prev,
        message: "Please fill in all fields",
        messageType: "error",
      }));
      return;
    }

    if (state.newPassword !== state.confirmPassword) {
      setState((prev) => ({
        ...prev,
        message: "Passwords do not match",
        messageType: "error",
      }));
      return;
    }

    if (state.newPassword.length < 6) {
      setState((prev) => ({
        ...prev,
        message: "Password must be at least 6 characters",
        messageType: "error",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, message: "" }));

    try {
      const res = await axios.post(`${apiURL}/api/user/reset-password`, {
        resetToken,
        newPassword: state.newPassword,
        confirmPassword: state.confirmPassword,
      });

      if (res.data.success) {
        setState((prev) => ({
          ...prev,
          loading: false,
          message: res.data.success,
          messageType: "success",
          passwordChanged: true,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          message: res.data.error || "Failed to reset password",
          messageType: "error",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        message: "Network error. Please try again.",
        messageType: "error",
      }));
    }
  };

  if (state.verifying) {
    return (
      <div className="flex items-center justify-center my-32">
        <svg
          className="w-12 h-12 animate-spin text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
      </div>
    );
  }

  if (state.passwordChanged) {
    return (
      <div className="flex flex-col items-center justify-center my-32">
        <div className="bg-green-50 border border-green-300 px-8 py-12 rounded-lg max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-2xl font-bold text-green-700 mb-4">Password Changed Successfully!</p>
          <p className="text-gray-700 mb-6">
            Your password has been reset. You can now login with your new password.
          </p>
          <p className="text-gray-600 text-sm">
            🔐 Your account is secure. Please keep your password safe and do not share it with anyone.
          </p>
        </div>
      </div>
    );
  }

  if (!state.tokenValid) {
    return (
      <div className="flex flex-col items-center justify-center my-32">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p className="font-bold">Invalid Reset Link</p>
          <p className="text-sm">{state.message}</p>
          <button
            onClick={() => history.push("/")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center my-32">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="newPassword">
              New Password<span className="text-sm text-gray-600 ml-1">*</span>
            </label>
            <input
              type="password"
              id="newPassword"
              value={state.newPassword}
              onChange={(e) => {
                const value = e.target.value;
                setState((prev) => ({
                  ...prev,
                  newPassword: value,
                  message: "",
                }));
              }}
              placeholder="Enter new password"
              className="border px-4 py-2 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="confirmPassword">
              Confirm Password<span className="text-sm text-gray-600 ml-1">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={state.confirmPassword}
              onChange={(e) => {
                const value = e.target.value;
                setState((prev) => ({
                  ...prev,
                  confirmPassword: value,
                  message: "",
                }));
              }}
              placeholder="Confirm password"
              className="border px-4 py-2 focus:outline-none"
            />
          </div>

          {state.message && (
            <div
              className={`px-4 py-2 rounded text-sm ${
                state.messageType === "success"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {state.message}
            </div>
          )}

          <button
            type="submit"
            disabled={state.loading}
            style={{ background: "#303031" }}
            className="w-full font-medium px-4 py-2 text-white text-center cursor-pointer disabled:opacity-50"
          >
            {state.loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

