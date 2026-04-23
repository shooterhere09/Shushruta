const { toTitleCase } = require("../config/function");
const categoryModel = require("../models/categories");
const fs = require("fs");
const path = require("path");

class Category {
  async getAllCategory(req, res) {
    try {
      let Categories = await categoryModel.find({}).sort({ _id: -1 });
      if (Categories) {
        return res.json({ Categories });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async postAddCategory(req, res) {
    let { cName, cDescription, cStatus } = req.body;
    let cImage = req.file ? req.file.filename : null;
    const filePath = cImage
      ? path.join(__dirname, "..", "public", "uploads", "categories", cImage)
      : null;

    if (!cName || !cDescription || !cStatus || !cImage) {
      if (filePath) {
        fs.unlink(filePath, () => {});
      }
      return res.json({ error: "All fields are required" });
    } else {
      cName = toTitleCase(cName);
      try {
        let checkCategoryExists = await categoryModel.findOne({ cName: cName });
        if (checkCategoryExists) {
          if (filePath) {
            fs.unlink(filePath, () => {});
          }
          return res.json({ error: "Category already exists" });
        } else {
          let newCategory = new categoryModel({
            cName,
            cDescription,
            cStatus,
            cImage,
          });
          await newCategory.save();
          return res.json({ success: "Category created successfully" });
        }
      } catch (err) {
        return res.json({ error: "Failed to create category" });
      }
    }
  }

  async postEditCategory(req, res) {
    let { cId, cDescription, cStatus } = req.body;
    if (!cId || !cDescription || !cStatus) {
      return res.json({ error: "All filled must be required" });
    }
    try {
      let editCategory = categoryModel.findByIdAndUpdate(cId, {
        cDescription,
        cStatus,
        updatedAt: Date.now(),
      });
      let edit = await editCategory.exec();
      if (edit) {
        return res.json({ success: "Category edit successfully" });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getDeleteCategory(req, res) {
    let { cId } = req.body;
    if (!cId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let deletedCategoryFile = await categoryModel.findById(cId);
        const filePath = deletedCategoryFile?.cImage
          ? path.join(__dirname, "..", "public", "uploads", "categories", deletedCategoryFile.cImage)
          : null;

        let deleteCategory = await categoryModel.findByIdAndDelete(cId);
        if (deleteCategory) {
          if (filePath) {
            fs.unlink(filePath, () => {});
          }
          return res.json({ success: "Category deleted successfully" });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
}

const categoryController = new Category();
module.exports = categoryController;
