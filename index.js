const express = require("express");
const app = express();
const router = require("./src/router/router");
const PORT = process.env.PORT || 3000;
require("dotenv").config();


app.use(express.json());
app.use("/api", router);  

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});