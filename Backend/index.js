const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connection = require("./db");
const userRouter = require("./routes/user.routes");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const chatRouter = require("./routes/chat.routes");
const messageRouter = require("./routes/message.routes");

const app = express();

// swagger API configuration //

const options={
    definition:{
        openapi:"3.0.0",
        info:{
            title:"Chatify(clone)",
            version:"1.0.0"
        },
        servers:[
            {
                url:"http://localhost:8080"
            }
        ]
    },
    apis:["./routes/*.js"]
}

//Swagger API specification

const openAPIspec=swaggerJsDoc(options)


// Swagger API UI build



app.use(cors());
app.use(express.json())
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openAPIspec));
app.use('/users',userRouter)
app.use("/chats",chatRouter)
app.use("/messages",messageRouter)

app.listen(process.env.PORT || 5000, async () => {
  try {
    await connection;
    console.log("Connected to the DB");
    console.log(`Server is running at port:-${process.env.PORT}`);
  } catch (error) {
    console.log(error.message);
  }
});
