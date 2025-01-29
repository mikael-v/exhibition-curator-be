const connectDB = require("../db.js");
const { ObjectId } = require("mongodb");

const fetchUsers = async (req, res) => {
  try {
    const db = await connectDB();

    const usersCollection = db.collection("users");
    const users = await usersCollection.find({}).toArray();
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const fetchUserCollections = async (req, res) => {
  const { userId } = req.params;

  try {
    const db = await connectDB();

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const collections = user.collections || {};
    if (Object.keys(collections).length === 0) {
      return res.json({ msg: "No Collections Found" });
    }

    const username = user.name;
    return res.json({
      username,
      collections,
    });
  } catch (error) {
    console.error("Error fetching collections:", error.message);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
};

const fetchIndividualCollections = async (req, res) => {
  const { userId, collectionName } = req.params;

  try {
    const db = await connectDB();

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });

    const collection = user.collections?.[collectionName];
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
      [collectionName]: collection,
    });
  } catch (error) {
    console.error("Error fetching individual collection:", error.message);
    res.status(500).json({ error: "Failed to fetch collection" });
  }
};

const addArtworkToCollection = async (req, res) => {
  const { userId, collectionName } = req.params;
  const { artworkId } = req.body;

  if (
    !collectionName ||
    typeof collectionName !== "string" ||
    collectionName.trim() === ""
  ) {
    return res.status(400).json({ msg: "Invalid collection name" });
  }

  try {
    const db = await connectDB();

    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!user.collections[collectionName]) {
      user.collections[collectionName] = [];
    }

    const collection = user.collections[collectionName];

    if (collection.includes(artworkId)) {
      return res.status(400).json({ msg: "Artwork already in collection" });
    }

    user.collections[collectionName] = collection.filter((item) => item !== "");

    user.collections[collectionName].push(artworkId);

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { collections: user.collections } }
    );

    return res.status(201).json({
      msg: `Artwork ${artworkId} added to collection '${collectionName}'`,
      collection: user.collections[collectionName],
    });
  } catch (error) {
    console.error("Error adding artwork:", error.message);
    res.status(500).json({ error: "Failed to add artwork" });
  }
};

const removeFromCollection = async (req, res) => {
  const { userId, collectionName } = req.params;
  const { artworkId } = req.body;

  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const collection = user.collections[collectionName];
    user.collections[collectionName] = collection.filter(
      (artwork) => artwork !== artworkId
    );

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { collections: user.collections } }
    );

    return res.status(200).json({
      msg: `Artwork ${artworkId} removed from collection '${collectionName}'`,
    });
  } catch (error) {
    console.error("Error removing artwork:", error.message);
    res.status(500).json({ error: "Failed to remove artwork" });
  }
};

export default {
  fetchUsers,
  fetchUserCollections,
  fetchIndividualCollections,
  addArtworkToCollection,
  removeFromCollection,
};
