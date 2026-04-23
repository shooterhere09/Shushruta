import React, { Fragment, useState } from "react";
import { signupReq } from "./fetchApi";

const Signup = (props) => {
  const [data, setData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
          street: "",
          city: "",
          state: "",
          postcode: "",
          country: "",
    street: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
    password: "",
    cPassword: "",
    userRole: 0, // 0 = Patient, 1 = Hospital/Procurement
    error: false,
    loading: false,
    success: false,
  });

  const alert = (msg, type) => (
    <div className={`text-sm text-${type}-500`}>{msg}</div>
  );

  const formSubmit = async () => {
    setData({ ...data, loading: true });
    if (data.cPassword !== data.password) {
      return setData({
        ...data,
        error: {
          cPassword: "Password doesn't match",
          password: "Password doesn't match",
        },
      });
    }
    try {
      let responseData = await signupReq({
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        street: data.street,
        city: data.city,
        state: data.state,
        postcode: data.postcode,
        country: data.country,
        password: data.password,
        cPassword: data.cPassword,
        userRole: data.userRole,
      });
      if (responseData.error) {
        setData({
          ...data,
          loading: false,
          error: responseData.error,
          password: "",
          cPassword: "",
        });
      } else if (responseData.success) {
        setData({
          success: responseData.success,
          name: "",
          email: "",
          password: "",
          cPassword: "",
          loading: false,
          error: false,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Fragment>
      <div className="text-center text-2xl mb-6">Create Account</div>
        <div className="flex flex-col">
          <label htmlFor="role">
            Account type<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <select
            id="role"
            className="px-4 py-2 focus:outline-none border"
            value={data.userRole}
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                userRole: Number(e.target.value),
              })
            }
          >
            <option value={0}>Patient</option>
            <option value={1}>Hospital / Procurement</option>
          </select>
        </div>
      <form className="space-y-4">
        {data.success ? alert(data.success, "green") : ""}
        <div className="flex flex-col">
          <label htmlFor="name">
            Name<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                name: e.target.value,
              })
            }
            value={data.name}
            type="text"
            id="name"
            className={`${
              data.error.name ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error.name, "red")}
        </div>
        <div className="flex flex-col">
          <label htmlFor="email">
            Email address<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                email: e.target.value,
              })
            }
            value={data.email}
            type="email"
            id="email"
            className={`${
              data.error.email ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error.email, "red")}
        </div>
        <div className="flex flex-col">
          <label htmlFor="phone">
            Phone number<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                phoneNumber: e.target.value,
              })
            }
            value={data.phoneNumber}
            type="tel"
            id="phone"
            className={`${
              data.error.phoneNumber ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error.phoneNumber, "red")}
        </div>
        <div className="flex flex-col">
          <label htmlFor="street">
            Street<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                street: e.target.value,
              })
            }
            value={data.street}
            type="text"
            id="street"
            className={`${
              data.error.street ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error.street, "red")}
        </div>
        <div className="flex flex-col">
          <label htmlFor="city">
            City<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                city: e.target.value,
              })
            }
            value={data.city}
            type="text"
            id="city"
            className={`${
              data.error.city ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error.city, "red")}
        </div>
        <div className="flex flex-col">
          <label htmlFor="state">
            State<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                state: e.target.value,
              })
            }
            value={data.state}
            type="text"
            id="state"
            className={`${
              data.error.state ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error.state, "red")}
        </div>
        <div className="flex flex-col">
          <label htmlFor="postcode">
            Postcode<span className="text-sm text-gray-600 ml-1"></span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                postcode: e.target.value,
              })
            }
            value={data.postcode}
            type="text"
            id="postcode"
            className={`${
              data.error.postcode ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error.postcode, "red")}
        </div>
        <div className="flex flex-col">
          <label htmlFor="country">
            Country<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                country: e.target.value,
              })
            }
            value={data.country}
            type="text"
            id="country"
            className={`${
              data.error.country ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error.country, "red")}
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">
            Password<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                password: e.target.value,
              })
            }
            value={data.password}
            type="password"
            id="password"
            className={`${
              data.error.password ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error.password, "red")}
        </div>
        <div className="flex flex-col">
          <label htmlFor="cPassword">
            Confirm password
            <span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                cPassword: e.target.value,
              })
            }
            value={data.cPassword}
            type="password"
            id="cPassword"
            className={`${
              data.error.cPassword ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error.cPassword, "red")}
        </div>
        <div className="flex flex-col">
          <div>
            <input
              type="checkbox"
              id="rememberMe"
              className="px-4 py-2 focus:outline-none border mr-1"
            />
            <label htmlFor="rememberMe">
              Remember me<span className="text-sm text-gray-600">*</span>
            </label>
          </div>
        </div>
        <div
          onClick={(e) => formSubmit()}
          style={{ background: "#303031" }}
          className="px-4 py-2 text-white text-center cursor-pointer font-medium"
        >
          Create an account
        </div>
      </form>
    </Fragment>
  );
};

export default Signup;
