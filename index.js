const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());

const { fetchArtworkById } = require("./api/individualArtwork.js");
const { fetchArtworks } = require("./api/allArtwork.js");
const { getAPIs } = require("./api/endpoints.js");

app.get("/", getAPIs);
app.get("/api", getAPIs);
app.get("/api/artwork", fetchArtworks);
app.get("/api/artwork/:id", fetchArtworkById);

app.use((err, req, res, next) => {
  if (err.code) {
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ msg: "Something went wrong!" });
});

const { PORT = 9091 } = process.env;
app.listen(PORT, () => console.log(`listening on port ${PORT}`));

module.exports = app;