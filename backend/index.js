const app = require("./app");

const { config } = require("dotenv");
const path = require("path");
const dataBaseConnect = require("./database.js/database");
const cloudinary = require("cloudinary");

const p = path.resolve();
//Handling uncaught Expections
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Unhandled Promise Rejections");
  process.exit(1);
});

config({ path: `${p}/backend/config/.env` });

dataBaseConnect();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(process.env.PORT, () => {
  console.log(`server is working in localhost:${process.env.PORT}`);
});
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to unhandled promise reactions");
  server.close(() => {
    process.exit(1);
  });
});
