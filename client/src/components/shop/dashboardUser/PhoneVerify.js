import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Layout, { DashboardUserContext } from "./Layout";
import { sendOtp, verifyOtp } from "./FetchApi";
import { fetchData } from "./Action";

const PhoneVerifyInner = () => {
  const { data, dispatch } = React.useContext(DashboardUserContext);
  const userDetails = data && data.userDetails ? data.userDetails : {};

  const history = useHistory();

  const [state, setState] = useState({ otp: "", message: "", sending: false, verifying: false });

  useEffect(() => {
    // nothing
  }, [userDetails]);

  const handleSend = async () => {
    if (!userDetails || !userDetails._id) return setState({ ...state, message: "User not found" });
    setState({ ...state, sending: true, message: "" });
    try {
      const res = await sendOtp({ uId: userDetails._id });
      if (res && res.success) {
        setState({ ...state, sending: false, message: "OTP sent" });
      } else if (res && res.otp) {
        setState({ ...state, sending: false, message: `OTP (dev): ${res.otp}` });
      } else {
        const message = res && res.error ? res.error : "Failed to send OTP";
        setState({ ...state, sending: false, message });
      }
    } catch (err) {
      setState({ ...state, sending: false, message: "Network error sending OTP" });
      console.error("sendOtp error", err);
    }
  };

  const handleVerify = async () => {
    if (!userDetails || !userDetails._id) return setState({ ...state, message: "User not found" });
    if (!state.otp) return setState({ ...state, message: "Please enter OTP" });
    setState({ ...state, verifying: true, message: "" });
    try {
      const res = await verifyOtp({ uId: userDetails._id, otp: state.otp });
      if (res && res.success) {
        setState({ ...state, verifying: false, message: "Phone verified" });
        // Refetch user data in parent
        await fetchData(dispatch);
        // give a short moment for user to see success message then redirect to profile
        setTimeout(() => history.push("/user/profile"), 800);
      } else {
        const message = res && res.error ? res.error : "Verification failed";
        setState({ ...state, verifying: false, message });
      }
    } catch (err) {
      setState({ ...state, verifying: false, message: "Network error verifying OTP" });
      console.error("verifyOtp error", err);
    }
  };

  return (
    <div className="w-full md:w-9/12 px-4 py-6">
      <div className="shadow border p-6">
        <h2 className="text-lg font-semibold mb-4">Verify Phone Number</h2>
        <div className="mb-4">
          <div>Phone: {userDetails.phoneNumber || "-"}</div>
          <div className="mt-2">
            <button onClick={handleSend} className="px-4 py-2 bg-yellow-600 text-white rounded">
              {state.sending ? "Sending..." : "Send OTP"}
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label>Enter OTP</label>
          <input value={state.otp} onChange={(e) => setState({ ...state, otp: e.target.value })} className="border px-3 py-2 w-full" />
        </div>
        <div>
          <button onClick={handleVerify} className="px-4 py-2 bg-green-600 text-white rounded">
            {state.verifying ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
        {state.message ? <div className="mt-4 text-sm">{state.message}</div> : null}
      </div>
    </div>
  );
};

const PhoneVerify = () => {
  // Pass the inner component as children so Layout provides the context
  return <Layout children={<PhoneVerifyInner />} />;
};

export default PhoneVerify;
