const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  collections: {
    type: Map,
    of: [String],
  },
});

userSchema.pre("save", async function (next) {
  if (!this.id) {
    const lastUser = await User.findOne().sort({ id: -1 }).lean();
    this.id = lastUser ? lastUser.id + 1 : 1;
  }
  next();
});

const User = mongoose.model("User", userSchema);

const generateUniqueId = async () => {
  const lastUser = await User.findOne().sort({ id: -1 }).lean();
  return lastUser ? lastUser.id + 1 : 1;
};

const createMultipleUsers = async () => {
  try {
    console.log("Deleting existing users...");
    await User.deleteMany({});

    console.log("Generating unique IDs for users...");

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

    for (let user of users) {
      user.id = await generateUniqueId();
    }

    console.log("Inserting users...");

    await User.insertMany(users);
    console.log("Multiple users created successfully");
  } catch (error) {
    console.error("Error inserting users:", error.message);
  }
};

createMultipleUsers();

const fetchUsers = async (req, res) => {
  try {
    console.log("Fetching users...");
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
