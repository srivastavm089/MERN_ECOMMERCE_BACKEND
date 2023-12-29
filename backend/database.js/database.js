// import mongoose from "mongoose";
const mongoose = require("mongoose");


const dataBaseConnect = ()=>{
    mongoose.connect(process.env.URL).then((host)=>{
        console.log(`mongodb is connected with server data ${host.connection.host}`)
    })
}
module.exports =  dataBaseConnect