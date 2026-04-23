import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

export const getUserById = async (uId) => {
  try {
    let res = await axios.post(`${apiURL}/api/user/single-user`, { uId });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getUserByHospitalId = async (hospitalId) => {
  try {
    let res = await axios.post(`${apiURL}/api/user/user-by-hospitalid`, { hospitalId });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const updatePersonalInformationFetch = async (userData) => {
  try {
    let res = await axios.post(`${apiURL}/api/user/edit-user`, userData);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getOrderByUser = async (uId) => {
  try {
    let res = await axios.post(`${apiURL}/api/order/order-by-user`, { uId });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const updatePassword = async (formData) => {
  try {
    let res = await axios.post(`${apiURL}/api/user/change-password`, formData);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const sendOtp = async (data) => {
  try {
    let res = await axios.post(`${apiURL}/api/user/send-otp`, data);
    return res.data;
  } catch (error) {
    console.log("sendOtp error", error);
    // Normalize error so caller can show useful message
    if (error.response && error.response.data) return error.response.data;
    return { error: error.message || "Network error" };
  }
};

export const verifyOtp = async (data) => {
  try {
    let res = await axios.post(`${apiURL}/api/user/verify-otp`, data);
    return res.data;
  } catch (error) {
    console.log("verifyOtp error", error);
    if (error.response && error.response.data) return error.response.data;
    return { error: error.message || "Network error" };
  }
};
