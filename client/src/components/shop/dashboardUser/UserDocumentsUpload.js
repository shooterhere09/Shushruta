import React, { Fragment, useState, useEffect } from "react";
import axios from "axios";
import { getUserById } from "./FetchApi";

const apiURL = process.env.REACT_APP_API_URL;
const BearerToken = () =>
  localStorage.getItem("jwt")
    ? JSON.parse(localStorage.getItem("jwt")).token
    : "";

const UserDocumentsUpload = () => {
  const [hospitalLicense, setHospitalLicense] = useState(null);
  const [registrationCertificate, setRegistrationCertificate] = useState(null);
  const [proofOfOwnership, setProofOfOwnership] = useState(null);

  const [hospitalLicenseUploaded, setHospitalLicenseUploaded] = useState(false);
  const [registrationCertificateUploaded, setRegistrationCertificateUploaded] = useState(false);
  const [proofOfOwnershipUploaded, setProofOfOwnershipUploaded] = useState(false);

  useEffect(() => {
    const fetchDocumentStatus = async () => {
      const loggedInUserId = localStorage.getItem("jwt")
        ? JSON.parse(localStorage.getItem("jwt")).user._id
        : "";
      if (loggedInUserId) {
        try {
          const response = await getUserById(loggedInUserId);
          if (response && response.User) {
            setHospitalLicenseUploaded(response.User.hospitalLicenseUploaded);
            setRegistrationCertificateUploaded(response.User.registrationCertificateUploaded);
            setProofOfOwnershipUploaded(response.User.proofOfOwnershipUploaded);
          }
        } catch (error) {
          console.error("Error fetching document status:", error);
        }
      }
    };
    fetchDocumentStatus();
  }, []);

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    if (hospitalLicense) {
      formData.append("hospitalLicense", hospitalLicense);
    }
    if (registrationCertificate) {
      formData.append("registrationCertificate", registrationCertificate);
    }
    if (proofOfOwnership) {
      formData.append("proofOfOwnership", proofOfOwnership);
    }

    const loggedInUserId = localStorage.getItem("jwt")
      ? JSON.parse(localStorage.getItem("jwt")).user._id
      : "";
    formData.append("loggedInUserId", loggedInUserId);

    try {
      const response = await axios.post(`${apiURL}/api/user/upload-documents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: `Bearer ${BearerToken()}`,
        },
      });

      alert("Documents uploaded successfully!");
      if (response.data.urls.hospitalLicense) {
        setHospitalLicenseUploaded(true);
      }
      if (response.data.urls.registrationCertificate) {
        setRegistrationCertificateUploaded(true);
      }
      if (response.data.urls.proofOfOwnership) {
        setProofOfOwnershipUploaded(true);
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      alert("Error uploading documents. Please try again.");
    }
  };

  return (
    <Fragment>
      <div className="flex flex-col w-full my-4 md:my-0 md:w-9/12 order-2 md:order-1">
        <div className="shadow-lg p-4 flex flex-col w-full mt-2">
          <h1 className="text-2xl font-semibold mb-4">Upload Your Documents</h1>
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="hospitalLicense" className="block text-lg font-medium text-gray-700">
                Hospital License
                {hospitalLicenseUploaded && <span className="ml-2 text-green-600 text-sm">(Uploaded)</span>}
              </label>
              <input
                type="file"
                id="hospitalLicense"
                name="hospitalLicense"
                onChange={(e) => handleFileChange(e, setHospitalLicense)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label htmlFor="registrationCertificate" className="block text-lg font-medium text-gray-700">
                Registration Certificate
                {registrationCertificateUploaded && <span className="ml-2 text-green-600 text-sm">(Uploaded)</span>}
              </label>
              <input
                type="file"
                id="registrationCertificate"
                name="registrationCertificate"
                onChange={(e) => handleFileChange(e, setRegistrationCertificate)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label htmlFor="proofOfOwnership" className="block text-lg font-medium text-gray-700">
                Proof of Ownership
                {proofOfOwnershipUploaded && <span className="ml-2 text-green-600 text-sm">(Uploaded)</span>}
              </label>
              <input
                type="file"
                id="proofOfOwnership"
                name="proofOfOwnership"
                onChange={(e) => handleFileChange(e, setProofOfOwnership)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              onClick={handleUpload}
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
            >
              Upload Documents
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default UserDocumentsUpload;