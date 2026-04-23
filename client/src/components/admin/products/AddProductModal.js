import React, { Fragment, useContext, useState, useEffect } from "react";
import { ProductContext } from "./index";
import { createProduct, getAllProduct } from "./FetchApi";
import { getAllCategory } from "../categories/FetchApi";
import { getUserById } from "../hospitalDetails/FetchApi";

const AddProductDetail = ({ categories }) => {
  const { data, dispatch } = useContext(ProductContext);

  const alert = (msg, type) => (
    <div className={`bg-${type}-200 py-2 px-4 w-full`}>{msg}</div>
  );

  const [fData, setFdata] = useState({
    pName: "",
    pTimeWindowHours: "",
    pDescription: "",
    pStatus: "Active",
    pImage: [],
    pCategory: "",

    pOffer: 0,
    pHospitalId: "",
    pQuantity: 0,
    pMedicalReport: null,
    success: false,
    error: false,
  });

  useEffect(() => {
    const fetchHospitalId = async () => {
      const currentUser = JSON.parse(localStorage.getItem("jwt"));
      if (currentUser && currentUser.user && currentUser.user._id) {
        const response = await getUserById(currentUser.user._id);
        if (response && response.User && response.User.hospitalId) {
          setFdata(prev => ({ ...prev, pHospitalId: response.User.hospitalId }));
        }
      }
    };
    fetchHospitalId();
  }, []);

  const submitForm = async (e) => {
    e.preventDefault();
    e.persist();

    if (fData.pImage.length < 1) {
      setFdata({ ...fData, error: "Please upload at least 1 image" });
      setTimeout(() => {
        setFdata({ ...fData, error: false });
      }, 2000);
      return;
    }

    console.log("fData before API call:", fData);
    const formData = new FormData();
    formData.append("pName", fData.pName);
    formData.append("pTimeWindowHours", fData.pTimeWindowHours);
    formData.append("pDescription", fData.pDescription);
    formData.append("pStatus", fData.pStatus);
    formData.append("pCategory", fData.pCategory);
    formData.append("pHospitalId", fData.pHospitalId);
    formData.append("pOffer", parseInt(fData.pOffer));
    formData.append("pQuantity", parseInt(fData.pQuantity));

    if (fData.pMedicalReport) {
      formData.append("pMedicalReport", fData.pMedicalReport);
    }

    for (const img of fData.pImage) {
      formData.append("pImage", img);
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem("jwt"));
      formData.append("user", currentUser ? currentUser.user._id : null);
      console.log("formData before API call:", Object.fromEntries(formData.entries()));

      let responseData = await createProduct(formData);
      console.log("API Response Data:", responseData);

      if (responseData.success) {
        e.target.reset();

        setFdata({
          pTimeWindowHours: "",
          pDescription: "",
          pImage: [],
          pStatus: "Active",
          pCategory: "",
          pHospitalId: "",
          pQuantity: "",
          pOffer: 0,
          pMedicalReport: null,
          success: responseData.success,
          error: false,
        });

        setTimeout(() => {
          setFdata({
            ...fData,
            success: false,
            error: false,
          });
          dispatch({ type: "addProductModal", payload: false });
        }, 2000);
      } else {
        setFdata({ ...fData, error: responseData.error });
        setTimeout(() => {
          setFdata({ ...fData, error: false });
        }, 2000);
      }
    } catch (err) {
      console.error("Error in submitForm:", err);
    }
  };

  return (
    <Fragment>
      {/* Overlay */}
      <div
        onClick={() => dispatch({ type: "addProductModal", payload: false })}
        className={`${
          data.addProductModal ? "" : "hidden"
        } fixed top-0 left-0 z-30 w-full h-full bg-black opacity-50`}
      />

      {/* Modal */}
      <div
        className={`${
          data.addProductModal ? "" : "hidden"
        } fixed inset-0 flex items-center justify-center z-40`}
      >
        <div className="mt-28 md:mt-0 relative bg-white w-11/12 md:w-3/6 shadow-lg flex flex-col px-6 py-6 space-y-4">

          {/* Header */}
          <div className="flex justify-between w-full">
            <span className="font-semibold text-2xl">Add Organ</span>

            <span
              onClick={() => dispatch({ type: "addProductModal", payload: false })}
              className="cursor-pointer bg-gray-800 text-white p-2 rounded-full"
            >
              ✕
            </span>
          </div>

          {fData.error && alert(fData.error, "red")}
          {fData.success && alert(fData.success, "green")}

          {/* FORM */}
          <form className="w-full" onSubmit={submitForm}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Organ Name */}
              <div className="flex flex-col">
                <label>Organ Name *</label>
                <input
                  type="text"
                  className="px-4 py-2 border"
                  value={fData.pName}
                  onChange={(e) =>
                    setFdata({ ...fData, pName: e.target.value })
                  }
                />
              </div>

              {/* Time Window */}
              <div className="flex flex-col">
                <label>Time Window *</label>
                <div className="flex">
                  <input
                    type="number"
                    className="px-4 py-2 border w-full"
                    value={fData.pTimeWindowHours}
                    onChange={(e) =>
                      setFdata({ ...fData, pTimeWindowHours: e.target.value })
                    }
                  />
                  <span className="ml-2">hrs</span>
                </div>
              </div>

              {/* Hospital ID */}
              <div className="flex flex-col">
                <label>Hospital ID *</label>
                <input
                  type="text"
                  className="px-4 py-2 border bg-gray-100"
                  value={fData.pHospitalId}
                  readOnly
                />
              </div>

              {/* Description */}
              <div className="flex flex-col md:col-span-2">
                <label>Organ Description *</label>
                <textarea
                  rows="3"
                  className="px-4 py-2 border"
                  value={fData.pDescription}
                  onChange={(e) =>
                    setFdata({ ...fData, pDescription: e.target.value })
                  }
                ></textarea>
              </div>

              {/* Organ Images */}
              <div className="flex flex-col md:col-span-2">
                <label>Organ Images *</label>
                <span className="text-xs text-gray-500">Upload at least 1 image</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="px-4 py-2 border"
                  onChange={(e) =>
                    setFdata({ ...fData, pImage: [...e.target.files] })
                  }
                />
              </div>

              {/* Medical Report */}
              <div className="flex flex-col md:col-span-2">
                <label>Medical Report</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.png,.doc,.docx"
                  className="px-4 py-2 border"
                  onChange={(e) =>
                    setFdata({ ...fData, pMedicalReport: e.target.files[0] })
                  }
                />
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label>Status *</label>
                <select
                  className="px-4 py-2 border"
                  value={fData.pStatus}
                  onChange={(e) =>
                    setFdata({ ...fData, pStatus: e.target.value })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>

              {/* Category */}
              <div className="flex flex-col">
                <label>Organ Category *</label>
                <select
                  className="px-4 py-2 border"
                  value={fData.pCategory}
                  onChange={(e) =>
                    setFdata({ ...fData, pCategory: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option value={c._id} key={c._id}>
                      {c.cName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="flex flex-col">
                <label>Quantity *</label>
                <input
                  type="number"
                  className="px-4 py-2 border"
                  value={fData.pQuantity}
                  onChange={(e) =>
                    setFdata({ ...fData, pQuantity: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              className="mt-4 w-full bg-gray-800 text-white py-2 rounded-full"
              type="submit"
            >
              Add Organ
            </button>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

const AddProductModal = () => {
  const [allCat, setAllCat] = useState([]);

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      let responseData = await getAllCategory();
      if (responseData && responseData.Categories) {
        setAllCat(responseData.Categories);
      }
    } catch (err) {
      console.error("fetchCategoryData error", err);
    }
  };

  return (
    <Fragment>
      <AddProductDetail categories={allCat} />
    </Fragment>
  );
};

export default AddProductModal;
