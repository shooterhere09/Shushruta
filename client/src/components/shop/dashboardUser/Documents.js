import React, { Fragment, useState, useEffect } from "react";
import axios from "axios";
import Layout from "./Layout";

const Documents = () => {
  const [aadharCard, setAadharCard] = useState(null);
  const [medicalReport, setMedicalReport] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [documentStatus, setDocumentStatus] = useState({
    aadharCardUploaded: false,
    medicalReportUploaded: false,
  });

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  useEffect(() => {
    const fetchUserDocumentStatus = async () => {
      const loggedInUserId = JSON.parse(localStorage.getItem("jwt")).user._id;
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/user/single-user`,
          { uId: loggedInUserId }
        );
        if (response.data.User) {
          setDocumentStatus({
            aadharCardUploaded: response.data.User.aadharCardUploaded,
            medicalReportUploaded: response.data.User.medicalReportUploaded,
          });
        }
      } catch (err) {
        console.error("Error fetching user document status:", err);
      }
    };
    fetchUserDocumentStatus();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const formData = new FormData();
    const loggedInUserId = JSON.parse(localStorage.getItem("jwt")).user._id;
    formData.append("loggedInUserId", loggedInUserId);

    if (aadharCard) {
      formData.append("aadharCard", aadharCard);
    }
    if (medicalReport) {
      formData.append("medicalReport", medicalReport);
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/upload-documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage(response.data.message);
      // Update document status after successful upload
      setDocumentStatus((prevStatus) => ({
        ...prevStatus,
        ...(aadharCard && { aadharCardUploaded: true }),
        ...(medicalReport && { medicalReportUploaded: true }),
      }));
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during upload.");
    }
  };

  return (
    <Layout>
      <Fragment>
        <div className="flex flex-col w-full my-4 md:my-0 md:w-9/12 order-2 md:order-1">
          <div className="shadow-lg p-4 flex flex-col w-full mt-2">
            <h1 className="text-2xl font-semibold mb-4">Upload Documents</h1>
            {message && <div className="bg-green-200 px-4 py-2 rounded">{message}</div>}
            {error && <div className="bg-red-200 px-4 py-2 rounded">{error}</div>}
            <form onSubmit={handleUpload} className="flex flex-col space-y-4">
              <div>
                <label htmlFor="aadharCard" className="block text-lg font-medium text-gray-700">{documentStatus.aadharCardUploaded && <span className="mr-2 px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Uploaded</span>}Aadhar Card</label>
                <input
                  type="file"
                  id="aadharCard"
                  name="aadharCard"
                  onChange={(e) => handleFileChange(e, setAadharCard)}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label htmlFor="medicalReport" className="block text-lg font-medium text-gray-700">{documentStatus.medicalReportUploaded && <span className="mr-2 px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Uploaded</span>}Medical Report</label>
                <input
                  type="file"
                  id="medicalReport"
                  name="medicalReport"
                  onChange={(e) => handleFileChange(e, setMedicalReport)}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <button
                type="submit"
                className="w-full text-center cursor-pointer px-4 py-2 text-gray-100"
                style={{ background: "#303031" }}
              >
                Upload Documents
              </button>
            </form>
          </div>
        </div>
      </Fragment>
    </Layout>
  );
};

export default Documents;