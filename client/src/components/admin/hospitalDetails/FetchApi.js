import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

export const getUserById = async (uId) => {
  try {
    let res = await axios.post(`${apiURL}/api/user/single-user`, { uId });
    return res.data;
  } catch (error) {
    console.log(error);
    return { error: "Failed to fetch user data" };
  }
};

