import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

export const getAllProduct = async () => {
  try {
    let res = await axios.get(`${apiURL}/api/product/all-product`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const createPorductImage = async ({ pImage }) => {
  /* Most important part for uploading multiple image  */
  let formData = new FormData();
  if (pImage && pImage.length > 0) {
    for (const file of pImage) {
      formData.append("pImage", file);
    }
  }
  /* Most important part for uploading multiple image  */
};

export const createProduct = async (data) => {
  // If the caller already provided a FormData instance (as AddProductModal does),
  // send it directly. Otherwise, build FormData from the plain object.
  let formData;

  if (data instanceof FormData) {
    formData = data;
  } else {
    const {
      pName,
      pDescription,
      pImage = [],
      pStatus,
      pCategory,
      pQuantity,
      pOffer,
      user,
    } = data;

    formData = new FormData();

    if (Array.isArray(pImage) && pImage.length > 0) {
      for (const file of pImage) {
        formData.append("pImage", file);
      }
    }

    formData.append("pName", pName);
    formData.append("pDescription", pDescription);
    formData.append("pStatus", pStatus);
    formData.append("pCategory", pCategory);
    formData.append("pQuantity", pQuantity);
    formData.append("pOffer", pOffer);
    formData.append("user", user);
  }

  try {
    const res = await axios.post(`${apiURL}/api/product/add-product`, formData);
    return res.data;
  } catch (error) {
    console.error("Error in createProduct API call:", error);
    return { error: "Failed to create product" };
  }
};

export const editProduct = async (product) => {
  console.log(product);
  /* Most important part for updating multiple image  */
  let formData = new FormData();
  if (product.pEditImages) {
    for (const file of product.pEditImages) {
      formData.append("pEditImages", file);
    }
  }
  /* Most important part for updating multiple image  */
  formData.append("pId", product.pId);
  formData.append("pName", product.pName);
  formData.append("pDescription", product.pDescription);
  formData.append("pStatus", product.pStatus);
  formData.append("pCategory", product.pCategory._id);
  formData.append("pQuantity", product.pQuantity);
  formData.append("pOffer", product.pOffer);
  formData.append("pImages", product.pImages);

  try {
    let res = await axios.post(`${apiURL}/api/product/edit-product`, formData);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteProduct = async (pId) => {
  try {
    let res = await axios.post(`${apiURL}/api/product/delete-product`, { pId });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const productByCategory = async (catId) => {
  try {
    let res = await axios.post(`${apiURL}/api/product/product-by-category`, {
      catId,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
