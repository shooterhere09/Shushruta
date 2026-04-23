import React, { Fragment, createContext, useReducer, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import AdminLayout from "../layout";
import { dashboardState, dashboardReducer } from "../dashboardAdmin/DashboardContext";
import { getUserById } from "./FetchApi";

export const DashboardContext = createContext();

const HospitalDetailsComponent = () => {
  const { data, dispatch } = useContext(DashboardContext);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    // Fetch complete hospital information from database
    const fetchHospitalData = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("jwt"));
        if (currentUser && currentUser.user && currentUser.user._id) {
          const response = await getUserById(currentUser.user._id);
          if (response && response.User) {
            console.log("Response User:", response.User);
            setHospitalInfo(response.User);
            setError(null);
          } else if (response && response.error) {
            setError(response.error);
            // Fallback to localStorage if API fails
            setHospitalInfo(currentUser.user);
          }
        }
      } catch (err) {
        console.error("Error fetching hospital data:", err);
        setError("Failed to load hospital information");
        // Fallback to localStorage
        const currentUser = JSON.parse(localStorage.getItem("jwt"));
        if (currentUser && currentUser.user) {
          setHospitalInfo(currentUser.user);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalData();
  }, []);

  const handleEditProfile = () => {
    history.push("/admin/dashboard/edit-profile");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Hospital Details</h2>
          <button
            onClick={handleEditProfile}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            Edit Profile
          </button>
        </div>

        {hospitalInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Basic Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Hospital ID:</span>
                  <span className="text-gray-800">{hospitalInfo.hospitalId || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Hospital Name:</span>
                  <span className="text-gray-800">{hospitalInfo.name || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="text-gray-800">{hospitalInfo.email || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Phone Number:</span>
                  <span className="text-gray-800">{hospitalInfo.phoneNumber || "Not provided"}</span>
                </div>

              </div>
            </div>

            {/* Account Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Account Status:</span>
                  <span className="text-green-600 font-semibold">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Registration Date:</span>
                  <span className="text-gray-800">
                    {hospitalInfo.createdAt ? new Date(hospitalInfo.createdAt).toLocaleDateString() : "Not available"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Last Updated:</span>
                  <span className="text-gray-800">
                    {hospitalInfo.updatedAt ? new Date(hospitalInfo.updatedAt).toLocaleDateString() : "Not available"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">User ID:</span>
                  <span className="text-gray-800 font-mono text-sm">{hospitalInfo._id || "Not available"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">Phone Verification:</span>
                  <div className="flex items-center gap-2">
                    {hospitalInfo.phoneVerified ? (
                      <>
                        <span className="text-green-600 font-semibold">✓ Verified</span>
                      </>
                    ) : (
                      <>
                        <span className="text-yellow-600 font-semibold">Not Verified</span>
                        <button
                          onClick={() => history.push("/admin/dashboard/edit-profile")}
                          className="ml-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition duration-200"
                        >
                          {hospitalInfo.phoneNumber ? "Verify Phone" : "Add Phone"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Address Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Street:</span>
                  <span className="text-gray-800">{hospitalInfo.address?.street || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">City:</span>
                  <span className="text-gray-800">{hospitalInfo.address?.city || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">State:</span>
                  <span className="text-gray-800">{hospitalInfo.address?.state || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Postcode:</span>
                  <span className="text-gray-800">{hospitalInfo.address?.postcode || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Country:</span>
                  <span className="text-gray-800">{hospitalInfo.address?.country || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Latitude:</span>
                  <span className="text-gray-800">{hospitalInfo.address?.latitude || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Longitude:</span>
                  <span className="text-gray-800">{hospitalInfo.address?.longitude || "Not provided"}</span>
                </div>
              </div>
            </div>

            {/* Hospital Statistics */}
            <div className="bg-gray-50 p-6 rounded-lg md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Hospital Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {data && data.totalData ? data.totalData.Products : 0}
                  </div>
                  <div className="text-gray-600">Total Organs Listed</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {data && data.totalData ? data.totalData.Orders : 0}
                  </div>
                  <div className="text-gray-600">Total Requests</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {data && data.totalData ? data.totalData.Categories : 0}
                  </div>
                  <div className="text-gray-600">Categories Used</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg">No hospital information available</div>
            <p className="text-gray-400 mt-2">Please contact support if you need assistance.</p>
          </div>
        )}
      </div>
    </Fragment>
  );
};

const HospitalDetails = (props) => {
  const [data, dispatch] = useReducer(dashboardReducer, dashboardState);

  return (
    <Fragment>
      <DashboardContext.Provider value={{ data, dispatch }}>
        <AdminLayout children={<HospitalDetailsComponent />} />
      </DashboardContext.Provider>
    </Fragment>
  );
};

export default HospitalDetails;
