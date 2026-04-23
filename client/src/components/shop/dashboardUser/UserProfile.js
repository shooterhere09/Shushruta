import React, { Fragment, useContext, useState, useEffect } from "react";
import Layout from "./Layout";
import { DashboardUserContext } from "./Layout";
import { updatePersonalInformationAction } from "./Action";
import { getUserByHospitalId } from "./FetchApi";
import { useHistory } from "react-router-dom";



const ProfileComponent = () => {
  const { data, dispatch } = useContext(DashboardUserContext);
  const userDetails = data.userDetails !== null ? data.userDetails : "";

  const [fData, setFdata] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
    latitude: "",
    longitude: "",
    hospitalId: "",
    hospitalInfo: {
      name: "",
      street: "",
      city: "",
      state: "",
      postcode: "",
      country: "",
      latitude: "",
      longitude: "",

      },
    success: false,
  });
  

  useEffect(() => {
    setFdata({
      ...fData,
      id: userDetails._id,
      name: userDetails.name,
      email: userDetails.email,
      phone: userDetails.phoneNumber,
      street: userDetails.address?.street || "",
      city: userDetails.address?.city || "",
      state: userDetails.address?.state || "",
      postcode: userDetails.address?.postcode || "",
      country: userDetails.address?.country || "",
      latitude: userDetails.address?.latitude || "",
      longitude: userDetails.address?.longitude || "",
      hospitalId: userDetails.hospitalId || "",
      hospitalInfo: {
        name: userDetails.hospitalInfo?.name || "",
        street: userDetails.hospitalInfo?.street || "",
        city: userDetails.hospitalInfo?.city || "",
        state: userDetails.hospitalInfo?.state || "",
        postcode: userDetails.hospitalInfo?.postcode || "",
        country: userDetails.hospitalInfo?.country || "",
        latitude: userDetails.hospitalInfo?.latitude || "",
        longitude: userDetails.hospitalInfo?.longitude || "",
      },
    });
    if (userDetails.hospitalId) {
      fetchHospitalDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetails]);

  const fetchHospitalDetails = async () => {
    if (fData.hospitalId) {
      try {
        const response = await getUserByHospitalId(fData.hospitalId);
        if (response && response.User) {
          const hospitalUser = response.User;
          setFdata((prevFdata) => ({
            ...prevFdata,








            hospitalInfo: {
              name: hospitalUser.name || "",
              street: hospitalUser.address?.street || "",
              city: hospitalUser.address?.city || "",
              state: hospitalUser.address?.state || "",
              postcode: hospitalUser.address?.postcode || "",
              country: hospitalUser.address?.country || "",
              latitude: hospitalUser.address?.latitude || "",
              longitude: hospitalUser.address?.longitude || "",
            },
          }));
        } else {
          // Clear address fields if hospital ID is not found or invalid
          setFdata((prevFdata) => ({
            ...prevFdata,








            hospitalInfo: {
      
      
      
      
      
      
      
      
            },
          }));
        }
      } catch (error) {
        console.error("Error fetching hospital details:", error);
        // Clear address fields on error
        setFdata((prevFdata) => ({
          ...prevFdata,








          hospitalInfo: {
    
    
    
    
    
    
    
    
          },
        }));
      }
    } else {
      // Clear address fields if hospital ID is empty
      setFdata((prevFdata) => ({
        ...prevFdata,
        name: "",
        street: "",
        city: "",
        state: "",
        postcode: "",
        country: "",
        latitude: "",
        longitude: "",
        hospitalInfo: {
          name: "",
          street: "",
          city: "",
          state: "",
          postcode: "",
          country: "",
          latitude: "",
          longitude: "",
        },
      }));
    }
  };

  const handleSubmit = () => {
    updatePersonalInformationAction(dispatch, {
      ...fData,
      address: {
        street: fData.street,
        city: fData.city,
        state: fData.state,
        postcode: fData.postcode,
        country: fData.country,
        latitude: fData.latitude,
        longitude: fData.longitude,
      },

    });
  };

  

  const history = useHistory();

  if (data.loading) {
    return (
      <div className="w-full md:w-9/12 flex items-center justify-center ">
        <svg
          className="w-12 h-12 animate-spin text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
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
  return (
    <Fragment>
      <div className="flex flex-col w-full my-4 md:my-0 md:w-9/12 md:px-8">
        <div className="shadow-lg border">
          <div className="py-4 px-4 text-lg font-semibold border-t-2 border-yellow-700">Personal Information</div>
          <hr />
          <div className="py-4 px-4 md:px-8 lg:px-16 flex flex-col space-y-4">
            {fData.success ? (
              <div className="bg-green-200 px-4 py-2 rounded">
                {fData.success}
              </div>
            ) : (
              ""
            )}
            <div className="flex flex-col space-y-2">
              <label htmlFor="name">Name</label>
              <input
                onChange={(e) => setFdata({ ...fData, name: e.target.value })}
                value={fData.name}
                type="text"
                id="name"
                className="border px-4 py-2 w-full focus:outline-none"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="hospitalId">Hospital ID</label>
              <div className="flex items-center space-x-2">
                <input
                  onChange={(e) => setFdata({ ...fData, hospitalId: e.target.value })}
                  value={fData.hospitalId}
                  type="text"
                  id="hospitalId"
                  className="border px-4 py-2 w-full focus:outline-none"
                />
                <button
                  onClick={fetchHospitalDetails}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
                >
                  Get Info
                </button>
              </div>
            </div>
            {fData.hospitalInfo.name && (
              <div className="flex flex-col space-y-2 border p-4 rounded-md bg-gray-50">
                <h3 className="text-md font-semibold">Hospital Details</h3>
                <p><strong>Name:</strong> {fData.hospitalInfo.name}</p>
                <p><strong>Street:</strong> {fData.hospitalInfo.street}</p>
                <p><strong>City:</strong> {fData.hospitalInfo.city}</p>
                <p><strong>State:</strong> {fData.hospitalInfo.state}</p>
                <p><strong>Postcode:</strong> {fData.hospitalInfo.postcode}</p>
                <p><strong>Country:</strong> {fData.hospitalInfo.country}</p>
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <label htmlFor="email">Email</label>
              <input
                value={fData.email}
                readOnly
                type="email"
                id="email"
                className="cursor-not-allowed border px-4 py-2 bg-gray-200 w-full focus:outline-none focus:cursor-not-allowed"
              />
              
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="number">Phone Number</label>
              <div className="flex items-center space-x-2">
                <input
                  onChange={(e) => setFdata({ ...fData, phone: e.target.value })}
                  value={fData.phone}
                  type="text"
                  id="number"
                  disabled={userDetails && userDetails.phoneVerified}
                  className={`border px-4 py-2 w-full focus:outline-none ${
                    userDetails && userDetails.phoneVerified
                      ? "cursor-not-allowed bg-gray-200"
                      : ""
                  }`}
                />
                {userDetails && userDetails.phoneVerified ? (
                  <span className="flex items-center space-x-2 text-green-600" title="Verified" aria-label="Phone number verified">
                    <span className="font-medium">Verified</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <button
                    onClick={() => history.push("/user/verify-phone")}
                    className="px-3 py-2 bg-yellow-600 text-white rounded"
                  >
                    Verify
                  </button>
                )}
              </div>
              {userDetails && userDetails.phoneVerified ? (
                <span className="text-xs text-gray-500">
                  Your phone number is verified and cannot be changed
                </span>
              ) : null}
            </div>

            {/* Address Fields */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="street">Street</label>
              <input
                onChange={(e) => {
                  setFdata({ ...fData, street: e.target.value });
                }}
                value={fData.street}
                type="text"
                id="street"
                className="border px-4 py-2 w-full focus:outline-none"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="city">City</label>
              <input
                onChange={(e) => setFdata({ ...fData, city: e.target.value })}
                value={fData.city}
                type="text"
                id="city"
                className="border px-4 py-2 w-full focus:outline-none"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="state">State</label>
              <input
                onChange={(e) => setFdata({ ...fData, state: e.target.value })}
                value={fData.state}
                type="text"
                id="state"
                className="border px-4 py-2 w-full focus:outline-none"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="postcode">Postcode</label>
              <input
                onChange={(e) => setFdata({ ...fData, postcode: e.target.value })}
                value={fData.postcode}
                type="text"
                id="postcode"
                className="border px-4 py-2 w-full focus:outline-none"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="country">Country</label>
              <input
                onChange={(e) => setFdata({ ...fData, country: e.target.value })}
                value={fData.country}
                type="text"
                id="country"
                className="border px-4 py-2 w-full focus:outline-none"
              />
            </div>

            <div
              onClick={(e) => handleSubmit()}
              style={{ background: "#303031" }}
              className="w-full text-center cursor-pointer px-4 py-2 text-gray-100"
            >
              Update Information
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

const UserProfile = (props) => {
  return (
    <Fragment>
      <Layout children={<ProfileComponent />} />
    </Fragment>
  );
};

export default UserProfile;
