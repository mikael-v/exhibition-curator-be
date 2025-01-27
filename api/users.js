const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  collections: {
    type: Map,
    of: [String],
    default: {},
  },
});

const User = mongoose.model("User", userSchema);

const createMultipleUsers = async () => {
  try {
    console.log("Deleting existing users...");
    await User.deleteMany({});

    console.log("Creating users with auto-generated IDs...");

    const users = [
      {
        name: "Alice",
        collections: {
          favourites: [],
          modernArt: [],
        },
      },
      {
        name: "Bob",
        collections: {
          paintings: [],
        },
      },
      {
        name: "Charlie",
        collections: {
          photography: [],
        },
      },
    ];

    await User.insertMany(users);
    console.log("Multiple users created successfully");
  } catch (error) {
    console.error("Error inserting users:", error.message);
  }
};


const fetchUsers = async (req, res) => {
  try {
    const users = await User.find({}, "_id name collections").lean();
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const fetchUserCollections = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).lean();
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
    const user = await User.findById(userId).lean();
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
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const collectionKeys = Array.from(user.collections.keys());

    if (!user.collections.has(collectionName)) {
      return res
        .status(404)
        .json({ msg: `Collection '${collectionName}' not found` });
    }

    const collection = user.collections.get(collectionName);

    if (collection.includes(artworkId)) {
      return res.status(400).json({ msg: "Artwork already in collection" });
    }

    user.collections.set(collectionName, [...collection, artworkId]);
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
    const user = await User.findById(userId);
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
