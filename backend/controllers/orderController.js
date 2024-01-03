const Order = require("../model/orderModal");
const Product = require("../model/productModal");
//Create new Order
exports.newOrder = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status,
    } = req.body;
    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status,
      paidAt: Date.now(),
      user: req.user._id,
    });
    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(501).json({
      success: false,
      message: "internal server error",
    });
  }
};

//get Single Order

exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `order not found with id ${req.params.id}`,
      });
    }
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(501).json({
      success: false,
      message: "internal server error",
    });
  }
};
//get logged in user Order
exports.myOrder = async (req, res) => {
  try {
    const order = await Order.find({ user: req.user._id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `order not found with id ${req.params.id}`,
      });
    }
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(501).json({
      success: false,
      message: "internal server error",
    });
  }
};

//get all order   -->admin
exports.getAllOrder = async (req, res) => {
  try {
    const order = await Order.find();
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `order not found with id ${req.params.id}`,
      });
    }

    let totalAmount = 0;
    order.forEach((item) => (totalAmount += item.totalPrice));
    res.status(200).json({
      success: true,
      order,
      totalAmount,
    });
  } catch (error) {
    res.status(501).json({
      success: false,
      message: "internal server error",
    });
  }
};

//update Order Status   -- admin
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order.orderStatus === "Delivered") {
      res.status(401).json({
        success: false,
        message: "order has been delivered",
      });
    }
   if(req.body.status==="shipped"){
    order.orderItems.forEach(async (item) => {
      await updateStock(item.product, item.quantity);
    });
   }
    order.orderStatus = req.body.status;
    if (req.body.status === "Delivered") {
      order.deliverAt = Date.now();
    }
    res.status(200).json({
      success: true,
      message: "order delivered",
    });

    await order.save({ validateBeforeSave: false });
  } catch (error) {
    res.status(501).json({
      success: false,
      message: "internal server error",
    });
  }
};
async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock = product.Stock - quantity;
  await product.save();
}

// delete Order  -- admin

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `order not found with id ${req.params.id}`,
      });
    }
    await Order.deleteOne({ _id: req.params.id });
    res.status(201).json({
      success: true,
      message: "deleted",
    });
  } catch (error) {
    res.status(501).json({
      success: false,
      message: "something went wrong",
    });
  }
};
