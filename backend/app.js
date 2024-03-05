const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const routes = require('./routes');
const dotenv = require('dotenv');

const app = new express();

// connect mongodb
dotenv.config({ path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`) });
const DB_URL = process.env.DB_URL;
mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// set static
app.use(express.static(path.join(__dirname, "public")));

app.use(routes);

app.listen(4000, () => {
  console.log("App listening on port 4000");
});
