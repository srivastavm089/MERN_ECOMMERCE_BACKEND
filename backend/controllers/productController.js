// import Product from "../model/productModal.js";

const Product = require("../model/productModal.js");
const ApiFeatures = require("../utils/apiFeatures.js");
const cloudinary = require("cloudinary");

//Create Product
exports.createProduct = async (req, res) => {
  console.log("this");
  console.log(req.body);
  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }
  const imagesLink = [];
  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });
    imagesLink.push({
      public_id: result.public_id,
      url: result.url,
    });
  }
  req.body.images = imagesLink;
  req.body.user = req.user.id;

  try {
    await Product.create(req.body);
    res.status(201).json({
      success: true,
      message: "product successfully",
    });
  } catch (error) {
    res.status(501).json({ success: false, message: "internol server error" });
  }
};

//GET ALL PRODUCT
exports.getAllProduct = async (req, res) => {
  const productsCount = await Product.countDocuments();
  const resultPerPage = 8;

  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  try {
    const product = await apiFeatures.query;

    res.status(200).json({
      success: true,
      product,
      productsCount,
      resultPerPage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "product not found",
    });
  }
};

//get all product admin
exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find({});

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(501).json({
      success: false,
      message: "internal server error",
    });
  }
};

//Update product --> admin

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "product not found",
      });
    }

    let images = [];
    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    if (images !== undefined) {
      console.log(product);
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }
    }

    const imagesLink = [];

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "products",
        });
        imagesLink.push({
          public_id: result.public_id,
          url: result.url,
        });
      }

      req.body.images = imagesLink;
    }

    const newproduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body } },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      success: true,
      product: newproduct,
    });
  } catch (error) {
    res.status(501).json({
      success: false,
      message: "internal server error",
    });
  }
};

//deleteProduct
exports.deleteProduct = async (req, res) => {
  try {
    const check = await Product.findById(req.params.id);

    if (!check) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }

    //delete product from cloudinary
    for (let i = 0; i < check.images.length; i++) {
      await cloudinary.v2.uploader.destroy(check.images[i].public_id);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "removed successfully",
    });
  } catch (error) {
    res.status(501).json({
      success: false,
      message: "internal server error",
    });
  }
};

//get product details

exports.getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json({ success: true, product });
  } catch (error) {
    res.json({ success: false, message: "product not found" });
  }
};

//create new review or update the review

exports.createProductReview = async (req, res) => {
  console.log("working");
  const { rating, comment, productId } = req.body;
  console.log(rating, comment, productId);

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(productId);
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  let avg = 0;
  product.ratings = product.reviews.forEach((rev) => {
    avg = +rev.rating;
  });
  product.ratings = avg / product.reviews.length;
  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
};

//get all review of a product

exports.getProductReview = async (req, res) => {
  const product = await Product.findById(req.query.id);
  if (!product) {
    return res.status(401).json({
      success: false,
      message: "not found",
    });
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
};

// delete review

exports.deleteReview = async (req, res) => {
  const product = await Product.findById(req.query.productId);
  if (!product) {
    return res.status(401).json({
      success: false,
      message: "not found",
    });
  }
  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );
  let avg = 0;
  reviews.forEach((rev) => {
    avg = +rev.rating;
  });
  const rating = avg / reviews.length;
  const numOfReviews = reviews.length;
  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      rating,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
};
