const express = require("express");
const cors = require("cors");
const findFreePort = require("find-free-port");
require("dotenv").config({ path: ".env.process" });
const connectDB = require("./db.js");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

const { fetchArtworkById } = require("./api/individualArtwork.js");
const { fetchArtworks } = require("./api/allArtwork.js");
const { getAPIs } = require("./api/endpoints.js");
const {
  fetchUsers,
  fetchUserCollections,
  fetchIndividualCollections,
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
  fetchIndividualCollections
);
app.post(
  "/api/users/:userId/collections/:collectionName",
  addArtworkToCollection
);
app.post("/api/users/:userId/collections", createNewCollection);

app.use((err, req, res, next) => {
  console.error("Error:", err.message || err);
  const status = err.status || 500;
  res.status(status).json({ msg: err.message || "Something went wrong!" });
});

const DEFAULT_PORT = 9091;
const PORT = process.env.PORT || DEFAULT_PORT;

findFreePort(PORT, (err, freePort) => {
  if (err) {
    console.error("Error finding a free port:", err);
    process.exit(1);
  }

  app.listen(freePort, () => {
    console.log(`Server is listening on port ${freePort}`);
  });
});

module.exports = app;
