const express = require("express");
const router = express.Router();
const productController = require("../controller/products");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/products");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/all-product", productController.getAllProduct.bind(productController));
router.post("/product-by-category", productController.getProductByCategory.bind(productController));
router.post("/product-by-price", productController.getProductByPrice.bind(productController));
router.post("/wish-product", productController.getWishProduct.bind(productController));
router.post("/cart-product", productController.getCartProduct.bind(productController));

router.post("/add-product", upload.any(), productController.postAddProduct.bind(productController));
router.post("/edit-product", upload.any(), productController.postEditProduct.bind(productController));
router.post("/delete-product", productController.getDeleteProduct.bind(productController));
router.post("/single-product", productController.getSingleProduct.bind(productController));

router.post("/add-review", productController.postAddReview.bind(productController));
router.post("/delete-review", productController.deleteReview.bind(productController));

module.exports = router;
