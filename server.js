const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const api = require("./routes/api");
app.use("/api", api);

const place = require("./routes/place.js");
app.use("/api/place", place);

const review = require("./routes/review.js");
app.use("/api/review", review);

const port = 3001;
app.listen(port, () => {
  console.log(`running on port ${port}`);
});
