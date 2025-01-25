const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  collections: {
    type: Map,
    of: [String],
  },
});

const User = mongoose.model("User", userSchema);

const createMultipleUsers = async () => {
  const users = [
    {
      id: 1,
      name: "Alice",
      collections: {
        favourites: [],
        modernArt: [],
      },
    },
    {
      id: 2,
      name: "Bob",
      collections: {},
    },
    {
      id: 3,
      name: "Charlie",
      collections: {
        photography: [],
      },
    },
  ];

  try {
    await User.insertMany(users);
    console.log("Multiple users created successfully");
  } catch (error) {
    console.error("Error inserting users:", error.message);
  }
};

createMultipleUsers();

const fetchUsers = async (req, res) => {
  try {
    const users = await User.find({}, "id name collections").lean();
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const fetchUserCollections = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ id: userId }).lean();
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const collections = user.collections || {};
    if (Object.keys(collections).length === 0) {
      return res.json({ msg: "No Collections Found" });
    }

    return res.json({
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
    const user = await User.findOne({ id: userId }).lean();
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

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
      userName: user.name,
      collectionName: collectionName,
      collection: collection,
    });
  } catch (error) {
    console.error("Error fetching individual collection:", error.message);
    res.status(500).json({ error: "Failed to fetch collection" });
  }
};

const addArtworkToCollection = async (req, res) => {
  const { userId, collectionName } = req.params;
  const { artworkId } = req.body;

  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!user.collections[collectionName]) {
      return res
        .status(404)
        .json({ msg: `Collection '${collectionName}' not found` });
    }

    const collection = user.collections[collectionName];
    if (collection.includes(artworkId)) {
      return res.status(400).json({ msg: "Artwork already in collection" });
    }

    collection.push(artworkId);
    await user.save();

    return res.status(201).json({
      msg: `Artwork ${artworkId} added to collection '${collectionName}'`,
      collection: user.collections[collectionName],
    });
  } catch (error) {
    console.error("Error adding artwork:", error.message);
    res.status(500).json({ error: "Failed to add artwork" });
  }
};

const createNewCollection = async (req, res) => {
  const { userId } = req.params;
  const { collectionName } = req.body;

  if (
    !collectionName ||
    typeof collectionName !== "string" ||
    collectionName.trim() === ""
  ) {
    return res.status(400).json({ msg: "Invalid collection name" });
  }

  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.collections[collectionName]) {
      return res
        .status(400)
        .json({ msg: `Collection '${collectionName}' already exists` });
    }

    user.collections[collectionName] = [];
    await user.save();

    return res.status(201).json({
      msg: `Collection '${collectionName}' created successfully`,
      collections: user.collections,
    });
  } catch (error) {
    console.error("Error creating collection:", error.message);
    res.status(500).json({ error: "Failed to create collection" });
  }
};

module.exports = {
  fetchUsers,
  fetchUserCollections,
  fetchIndividualCollections,
  addArtworkToCollection,
  createNewCollection,
};
