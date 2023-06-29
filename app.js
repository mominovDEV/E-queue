const express = require("express");
const config = require("config");

const PORT = config.get("port") || 3030;

const app = express();

app.use(express.json());

async function start() {
  try {
    app.listen(PORT, () => {
      console.log(`Server ${PORT}-portda ishga tushdi`);
    });
  } catch (error) {
    console.log(error);
  }
}


start();