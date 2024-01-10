const express=require("express")
require("dotenv").config()
const cors=require("cors")
const connection = require("./db")

const app=express()

app.use(cors())

app.listen(process.env.PORT||5000,async()=>{
    try {
        await connection
        console.log("Connected to the DB")
        console.log(`Server is running at port:-${process.env.PORT}`)
    } catch (error) {
        console.log(error.message)
    }
})