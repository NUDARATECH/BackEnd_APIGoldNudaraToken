const express = require("express");
const app = express();
const schedule = require("node-schedule");
const axios = require("axios");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();
app.use(express.json());
app.use(cors());

const api = `https://metals-api.com/api/latest?access_key=${process.env.KEY}&base=XAU&symbols=USD`;

//GET GOLD PRICE FROM API AND STORE IN BD
const getGoldPriceInGrams = async () => {
  let rawdata = fs.readFileSync("./data.json");
  let data = JSON.parse(rawdata);
  const value = data.rates.USD;
  const priceInGrams = (value / 31.1035).toFixed(2);
  return priceInGrams;
};
const getGoldPriceFromApi = async () => {
  const { data } = await axios.get(api);
  fs.writeFileSync("./data.json", JSON.stringify(data));
};
//RUN CODE EVERY DAY AT 0 UTC
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 4;
rule.tz = "Etc/UTC";

const job = schedule.scheduleJob(rule, async function () {
  await getGoldPriceFromApi();
  console.log("job done");
});

//API TO GET GOLD PRICE FROM BD
app.get("/api/gold", async (req, res) => {
  let value = await getGoldPriceInGrams();
  res.json({ ok: true, price: value });
});

app.listen(
  process.env.PORT,
  console.log("Server iniciado en el puerto: " + process.env.PORT)
);
