require("dotenv").config();
require("./bot.js");
const express = require("express");

const app = express();

app.get("/", async (req, res, next) => {
  res.send(`Hello from "LinkConterter Bot" \n i am alive and is running...`);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Example app listening at http://127.0.0.1:${PORT}`);
});
