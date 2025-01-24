const fs = require("fs");
const path = require("path");

const usersFile = path.join(__dirname, "../users.JSON");
let mockUsers = {};

if (fs.existsSync(usersFile)) {
  try {
    mockUsers = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
    console.log("mockUsers loaded from file.");
  } catch (err) {
    console.error(
      "Error reading mockUsers file. Initializing with default data."
    );
  }
} else {
  console.warn("mockUsers file not found. Initializing with default data.");
  mockUsers = {
    user1: {
      id: 1,
      name: "Alice",
      collections: {
        favorites: [],
        modernArt: [],
      },
    },
    user2: {
      id: 2,
      name: "Bob",
      collections: {},
    },
    user3: {
      id: 3,
      name: "Charlie",
      collections: {},
    },
  };
  saveUsersToFile();
}

const saveUsersToFile = () => {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(mockUsers, null, 2), "utf-8");
    console.log("mockUsers saved to file.");
  } catch (err) {
    console.error("Error saving mockUsers to file:", err.message);
  }
};

const fetchUsers = (req, res) => {
  try {
    const users = Object.values(mockUsers).map((user) => ({
      id: user.id,
      name: user.name,
      collections: user.collections,
    }));
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const fetchUserCollections = (req, res) => {
  const { userId } = req.params;

  const user = mockUsers[`user${userId}`];

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  const collections = user.collections;

  if (Object.keys(collections).length === 0) {
    return res.json({ msg: "No Collections Found" });
  }

  return res.json({
    collections,
  });
};

const fetchIndividualCollections = (req, res) => {
  const { userId, collectionName } = req.params;
  const user = mockUsers[`user${userId}`];

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  const collections = user.collections;

  if (Object.keys(collections).length === 0) {
    return res.json({ msg: "No collections found" });
  }

  const collection = collections[collectionName];

  if (!collection) {
    return res
      .status(404)
      .json({ msg: `Collection '${collectionName}' not found` });
  }

  if (collection.length === 0) {
    return res
      .status(404)
      .json({ msg: `No artwork found in '${collectionName}'` });
  }

  return res.json({
    userName: user.name,
    collectionName: collectionName,
    collection: collection,
  });
};

const addArtworkToCollection = (req, res) => {
  const { userId, collectionName } = req.params;
  const { artworkId } = req.body;

  const normalizedArtworkId = String(artworkId);

  const userKey = `user${userId}`;
  const user = mockUsers[userKey];

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  let collection = user.collections[collectionName];

  if (collection && !Array.isArray(collection)) {
    console.warn(
      `Collection '${collectionName}' is not an array. Reinitializing.`
    );
    collection = user.collections[collectionName] = [];
  }

  if (!collection) {
    return res
      .status(404)
      .json({ msg: `Collection '${collectionName}' not found` });
  }

  if (collection.includes(normalizedArtworkId)) {
    return res.status(400).json({ msg: "Artwork already in collection" });
  }

  collection.push(normalizedArtworkId);
  saveUsersToFile();

  return res.status(201).json({
    msg: `Artwork ${artworkId} added to collection '${collectionName}'`,
    collection: user.collections[collectionName],
  });
};

const createNewCollection = (req, res) => {
  const { userId } = req.params;
  const { collectionName } = req.body;

  if (
    !collectionName ||
    typeof collectionName !== "string" ||
    collectionName.trim() === ""
  ) {
    return res.status(400).json({ msg: "Invalid collection name" });
  }

  const user = mockUsers[`user${userId}`];
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  if (user.collections[collectionName]) {
    return res
      .status(400)
      .json({ msg: `Collection '${collectionName}' already exists` });
  }

  user.collections[collectionName] = [];
  saveUsersToFile();

  return res.status(201).json({
    msg: `Collection '${collectionName}' created successfully`,
    collections: user.collections,
  });
};

module.exports = {
  fetchUsers,
  fetchUserCollections,
  fetchIndividualCollections,
  addArtworkToCollection,
  createNewCollection,
};
