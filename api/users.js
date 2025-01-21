const mockUsers = {
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
    userId: user.id,
    userName: user.name,
    collections,
  });
};

const fetchInidividualCollections = (req, res) => {
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
    userId: user.id,
    userName: user.name,
    collectionName: collectionName,
    collection: collection,
  });
};

module.exports = {
  fetchUsers,
  fetchUserCollections,
  fetchInidividualCollections,
};
