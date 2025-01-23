const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
const findFreePort = require("find-free-port");

const { fetchArtworkById } = require("./api/individualArtwork.js");
const { fetchArtworks } = require("./api/allArtwork.js");
const { getAPIs } = require("./api/endpoints.js");
const {
  fetchUsers,
  fetchUserCollections,
  fetchInidividualCollections,
  addArtworkToCollection,
  createNewCollection,
} = require("./api/users.js");

app.get("/", getAPIs);
app.get("/api", getAPIs);
app.get("/api/artwork", fetchArtworks);
app.get("/api/artworks", fetchArtworks);
app.get("/api/artwork/:id", fetchArtworkById);
app.get("/api/artworks/:id", fetchArtworkById);
app.get("/api/users", fetchUsers);
app.get("/api/users/:userId/collections", fetchUserCollections);
app.get(
  "/api/users/:userId/collections/:collectionName",
  fetchInidividualCollections
);
app.post(
  "/api/users/:userId/collections/:collectionName",
  addArtworkToCollection
);
app.post("/api/users/:userId/collections", createNewCollection);

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

const DEFAULT_PORT = 9091;

findFreePort(DEFAULT_PORT, (err, freePort) => {
  if (err) {
    console.error("Error finding a free port:", err);
    process.exit(1);
  }

  app.listen(freePort, () => {
    console.log(`Server is listening on port ${freePort}`);
  });
});

module.exports = app;
