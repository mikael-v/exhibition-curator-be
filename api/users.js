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

module.exports = { fetchUsers };
