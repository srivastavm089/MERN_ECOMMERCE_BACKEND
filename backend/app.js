const express = require("express");
const product = require("./routes/productRoute");
const userRoute = require("./routes/userRoutes");
const orderRoute = require("./routes/orderRoute");
const  bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const payment = require("./routes/payementRoute")
const cors = require("cors");

const app = express();


app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.use("/api/v1/", product);
app.use("/api/v1/", userRoute);
app.use("/api/v1/", orderRoute);
app.use("/api/v1/", payment);

//middleware for error;

module.exports = app;
