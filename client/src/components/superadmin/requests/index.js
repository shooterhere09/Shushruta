import React, { Fragment, useEffect, useState } from "react";
import moment from "moment";
import axios from "axios";

const apiURL = process.env.REACT_APP_API_URL;

const SuperAdminRequestsComponent = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiURL}/api/order/get-all-orders`);
      setRequests(response.data.Orders);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
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
    <div className="grid grid-cols-1 space-y-4 p-4">
      <h2>All Requests</h2>
      <div className="col-span-1 overflow-auto bg-white shadow-lg p-4">
        <table className="table-auto border w-full my-2">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Organ ID</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Hospital</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Phone</th>
              <th className="px-4 py-2 border">Address</th>
              <th className="px-4 py-2 border">Created at</th>
              <th className="px-4 py-2 border">Updated at</th>
            </tr>
          </thead>
          <tbody>
            {requests && requests.length > 0 ? (
              requests.map((item, i) => (
                <tr className="border-b" key={i}>
                  <td className="w-48 hover:bg-gray-200 p-2 flex flex-col space-y-1">
                    {item.allProduct && item.allProduct.map((product, idx) => (
                      <span className="block flex items-center space-x-2" key={idx}>
                        <img
                          className="w-8 h-8 object-cover object-center"
                          src={`${apiURL}/uploads/products/${product?.id?.pImages?.[0] || "default.png"}`}
                          alt="productImage"
                        />

                      </span>
                    ))}
                  </td>
                  <td className="hover:bg-gray-200 p-2 text-center cursor-default">
                    {item.status === "Not processed" && (
                      <span className="block text-red-600 rounded-full text-center text-xs px-2 font-semibold">
                        {item.status}
                      </span>
                    )}
                    {item.status === "Under Scrutiny" && (
                      <span className="block text-yellow-600 rounded-full text-center text-xs px-2 font-semibold">
                        {item.status}
                      </span>
                    )}
                    {item.status === "Request Accepted" && (
                      <span className="block text-blue-600 rounded-full text-center text-xs px-2 font-semibold">
                        {item.status}
                      </span>
                    )}
                    {item.status === "Expired" && (
                      <span className="block text-green-600 rounded-full text-center text-xs px-2 font-semibold">
                        {item.status}
                      </span>
                    )}
                    {item.status === "Cancelled" && (
                      <span className="block text-red-600 rounded-full text-center text-xs px-2 font-semibold">
                        {item.status}
                      </span>
                    )}
                  </td>
                  <td className="hover:bg-gray-200 p-2 text-center">{item.hname || "N/A"}</td>
                  <td className="hover:bg-gray-200 p-2 text-center">{item.hemail || "N/A"}</td>
                  <td className="hover:bg-gray-200 p-2 text-center">{item.hphone || "N/A"}</td>
                  <td className="hover:bg-gray-200 p-2 text-center">{item.address || "N/A"}</td>
                  <td className="hover:bg-gray-200 p-2 text-center">
                    {item.createdAt ? moment(item.createdAt).format("lll") : "N/A"}
                  </td>
                  <td className="hover:bg-gray-200 p-2 text-center">
                    {item.updatedAt ? moment(item.updatedAt).format("lll") : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4">No requests found</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="text-sm text-gray-600 mt-2">
          Total {requests && requests.length} Requests found
        </div>
      </div>
    </div>
  );
};

const SuperAdminRequests = () => {
  return (
    <Fragment>
      <SuperAdminRequestsComponent />
    </Fragment>
  );
}

export default SuperAdminRequests;