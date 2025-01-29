const fetchUsers = async (req, res) => {
  try {
    const users = await users.find({}, "_id name collections").lean();
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const fetchUserCollections = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await users.findById(userId).lean();
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
    const user = await users.findById(userId).lean();
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
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    console.log("user:", user);
    console.log("collection:", user.collections);

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
    console.log(user);

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
    const user = await Users.findById(userId);
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

const removeFromCollection = async (req, res) => {
  const { userId, collectionName } = req.params;
  const { artworkId } = req.body;

  try {
    const user = await Users.findById(userId);
    console.log("id:", userId);
    console.log("user:", user);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!user.collections || !user.collections[collectionName]) {
      return res
        .status(404)
        .json({ msg: `Collection '${collectionName}' not found` });
    }

    const collection = user.collections[collectionName];

    if (!collection.includes(artworkId)) {
      return res
        .status(400)
        .json({ msg: "Artwork not found in this collection" });
    }

    user.collections[collectionName] = collection.filter(
      (artwork) => artwork !== artworkId
    );

    await user.save();

    return res.status(200).json({
      msg: `Artwork ${artworkId} removed from collection '${collectionName}'`,
      collection: user.collections.get(collectionName),
    });
  } catch (error) {
    console.error("Error removing artwork:", error.message);
    res.status(500).json({ error: "Failed to remove artwork" });
  }
};

module.exports = {
  fetchUsers,
  fetchUserCollections,
  fetchIndividualCollections,
  addArtworkToCollection,
  createNewCollection,
  removeFromCollection,
};
