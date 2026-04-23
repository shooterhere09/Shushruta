const productModel = require("../models/products");
const userModel = require("../models/users");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class Product {
  // Delete Image from uploads -> products folder
  static deleteImages(images, mode) {
    var basePath =
      path.resolve(__dirname + "../../") + "/public/uploads/products/";

    for (var i = 0; i < images.length; i++) {
      let filePath = "";
      if (mode == "file") {
        filePath = basePath + `${images[i].filename}`;
      } else {
        filePath = basePath + `${images[i]}`;
      }

      if (fs.existsSync(filePath)) {

      }
      fs.unlink(filePath, (err) => {
        if (err) {
          return err;
        }
      });
    }
  }

  async getAllProduct(req, res) {
    try {
      let Products = await productModel
        .find({})
        .populate("pCategory", "_id cName")
        .sort({ _id: -1 });
      if (Products) {
        return res.json({ Products });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async postAddProduct(req, res) {



    let { pName, pTimeWindowHours, pDescription, pQuantity, pCategory, pOffer, pStatus, user } = req.body;
    let images = req.files.filter(file => file.fieldname === "pImage");
    let medicalReport = req.files.find(file => file.fieldname === "pMedicalReport");
    console.log("medicalReport:", medicalReport);
    console.log("images.length:", images.length);
    // Validation
    if (
      !pName ||
      !pTimeWindowHours ||
      !pDescription ||
      (!pQuantity && pQuantity !== 0 ? true : false) ||
      !pCategory ||
      (pOffer === undefined || pOffer === null) ||
      !pStatus ||
      !user ||
      !medicalReport
    ) {
      if (images.length > 0) Product.deleteImages(images, "file");
      if (medicalReport) fs.unlink(medicalReport.path, (err) => err);
      return res.json({ error: "All filled must be required" });
    }
    // Validate Name and description
    else if (pDescription.length > 3000) {
      if (images.length > 0) Product.deleteImages(images, "file");
      if (medicalReport) fs.unlink(medicalReport.path, (err) => err);
      return res.json({
        error: "Name 255 & Description must not be 3000 charecter long",
      });
    }
    // Validate Images
    else if (images.length < 1) {
      if (images.length > 0) Product.deleteImages(images, "file");
      if (medicalReport) fs.unlink(medicalReport.path, (err) => err);
      return res.json({ error: "Must need to provide at least 1 image" });
    } else {
      try {
        // Fetch hospital user details to auto-populate contact information
        const hospitalUser = await userModel.findById(user).select("name email phoneNumber userType");
        
        if (!hospitalUser) {
          if (images.length > 0) Product.deleteImages(images, "file");
          if (medicalReport) fs.unlink(medicalReport.path, (err) => err);
          return res.json({ error: "Hospital user not found" });
        }
        
        if (hospitalUser.userType !== "hospital") {
          if (images.length > 0) Product.deleteImages(images, "file");
          if (medicalReport) fs.unlink(medicalReport.path, (err) => err);
          return res.json({ error: "Only hospitals can add products" });
        }
        
        let allImages = [];
        for (const img of images) {
          allImages.push(img.filename);
        }
        let newProduct = new productModel({
          pImages: allImages,
          pName,
          pTimeWindowHours,
          expiryAt: new Date(Date.now() + pTimeWindowHours * 3600000),
          isExpired: false,
          pDescription,

          pQuantity,
          pCategory,
          pOffer,
          pStatus,
          user,
          hname: hospitalUser.name,
          hemail: hospitalUser.email,
          hphone: hospitalUser.phoneNumber || "",
        });
        let save = await newProduct.save();
        if (save) {
          // Handle medical report upload to Cloudinary
          if (medicalReport) {
            const organId = save._id;
            const folderPath = `shushruta/organs/${organId}/medical_report`;
            try {
              const result = await cloudinary.uploader.upload(medicalReport.path, {
                folder: folderPath,
              });
              // Update product with medical report URL (will require model update)
              await productModel.findByIdAndUpdate(organId, {
                $set: { pMedicalReport: result.secure_url }
              });
              // Delete temporary file
              fs.unlink(medicalReport.path, (err) => err);
            } catch (cloudErr) {

              // Delete product if medical report upload fails
              await productModel.findByIdAndDelete(organId);
              Product.deleteImages(images, "file");
              fs.unlink(medicalReport.path, (err) => err);
              return res.json({ error: "Failed to upload medical report" });
            }
          }
          return res.json({ success: "Product created successfully" });
        }
      } catch (err) {
        console.error(err);
        if (images.length > 0) Product.deleteImages(images, "file");
        if (medicalReport) fs.unlink(medicalReport.path, (err) => err);
        return res.json({ error: "Product creation failed" });
      }
    }
  }

  async postEditProduct(req, res) {
    let {
      pId,
      pName,
      pTimeWindowHours,
      pDescription,

      pQuantity,
      pCategory,
      pOffer,
      pStatus,
      pImages,
    } = req.body;
    let editImages = req.files;

    // Validate other fileds
    if (
      !pId ||
      !pName ||
      !pDescription ||
      (!pQuantity && pQuantity !== 0 ? true : false) ||
      !pCategory ||
      (pOffer === undefined || pOffer === null) ||
      !pStatus
    ) {
      return res.json({ error: "All filled must be required" });
    }
    // Validate Name and description
    else if (pName.length > 255 || pDescription.length > 3000) {
      return res.json({
        error: "Name 255 & Description must not be 3000 charecter long",
      });
    }
    // Validate Update Images
    else if (editImages && editImages.length < 1) {
      Product.deleteImages(editImages, "file");
      return res.json({ error: "Must need to provide at least 1 image" });
    } else {
      let editData = {
        pName,
        pDescription,
        pTimeWindowHours,
        pQuantity,
        pCategory,
        pOffer,
        pStatus,
      };
      if (editImages && editImages.length > 0) {
        let allEditImages = [];
        for (const img of editImages) {
          allEditImages.push(img.filename);
        }
        editData = { ...editData, pImages: allEditImages };
        if (pImages) {
          if (typeof pImages === "string") {
            Product.deleteImages(pImages.split(","), "string");
          } else if (Array.isArray(pImages)) {
            Product.deleteImages(pImages, "string");
          }
        }
      }
      try {
        await productModel.findByIdAndUpdate(pId, editData);
        return res.json({ success: "Product edit successfully" });
      } catch (err) {
        return res.json({ error: "Product edit failed" });
      }
    }
  }

  async getDeleteProduct(req, res) {
    let { pId } = req.body;
    if (!pId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let deleteProductObj = await productModel.findById(pId);
        let deleteProduct = await productModel.findByIdAndDelete(pId);
        if (deleteProduct) {
          // Delete Image from uploads -> products folder
          Product.deleteImages(deleteProductObj.pImages, "string");
          return res.json({ success: "Product deleted successfully" });
        }
      } catch (err) {

      }
    }
  }

  async getSingleProduct(req, res) {
    let { pId } = req.body;
    if (!pId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let singleProduct = await productModel
          .findById(pId)
          .populate("pCategory", "cName")
          .populate("pRatingsReviews.user", "name email userImage");
        if (singleProduct) {
          return res.json({ Product: singleProduct });
        }
      } catch (err) {

      }
    }
  }

  async getProductByCategory(req, res) {
    let { catId } = req.body;
    if (!catId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let products = await productModel
          .find({ pCategory: catId })
          .populate("pCategory", "cName");
        if (products) {
          return res.json({ Products: products });
        }
      } catch (err) {
        return res.json({ error: "Search product wrong" });
      }
    }
  }

  async getProductByPrice(req, res) {
    let { priceLow, priceHigh } = req.body;
    if (!priceLow || !priceHigh) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let products = await productModel
          .find({ pPrice: { $gte: priceLow, $lte: priceHigh } })
          .populate("pCategory", "cName")
          .sort({ pPrice: -1 });
        if (products) {
          return res.json({ Products: products });
        }
      } catch (err) {
        return res.json({ error: "Filter product by price wrong" });
      }
    }
  }


  async getWishProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let wishProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (wishProducts) {
          return res.json({ Products: wishProducts });
        }
      } catch (err) {
        return res.json({ error: "Filter product wrong" });
      }
    }
  }

  async getCartProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let cartProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (cartProducts) {
          return res.json({ Products: cartProducts });
        }
      } catch (err) {
        return res.json({ error: "Cart product wrong" });
      }
    }
  }

  async postAddReview(req, res) {
    let { pId, uId, rating, review } = req.body;
    if (!pId || !rating || !review || !uId) {
      return res.json({ error: "All filled must be required" });
    } else {
      let checkReviewRatingExists = await productModel.findOne({ _id: pId });
      if (checkReviewRatingExists.pRatingsReviews.length > 0) {
        checkReviewRatingExists.pRatingsReviews.map((item) => {
          if (item.user === uId) {
            return res.json({ error: "Your already reviewd the product" });
          } else {
            try {
              let newRatingReview = productModel.findByIdAndUpdate(pId, {
                $push: {
                  pRatingsReviews: {
                    review: review,
                    user: uId,
                    rating: rating,
                  },
                },
              });
              newRatingReview.exec((err, result) => {
                if (err) {
                  if (err);
                }
                return res.json({ success: "Thanks for your review" });
              });
            } catch (err) {
              return res.json({ error: "Cart product wrong" });
            }
          }
        });
      } else {
        try {
          let newRatingReview = productModel.findByIdAndUpdate(pId, {
            $push: {
              pRatingsReviews: { review: review, user: uId, rating: rating },
            },
          });
          await newRatingReview;
          return res.json({ success: "Thanks for your review" });
        } catch (err) {
          return res.json({ error: "Cart product wrong" });
        }
      }
    }
  }

  async deleteReview(req, res) {
    let { rId, pId } = req.body;
    if (!rId) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        await productModel.findByIdAndUpdate(pId, {
          $pull: { pRatingsReviews: { _id: rId } },
        });
        return res.json({ success: "Your review is deleted" });
      } catch (err) {

      }
    }
  }
}

const productController = new Product();
module.exports = productController;
