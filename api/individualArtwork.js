const axios = require("axios");

module.exports = async (req, res) => {
  const { id } = req.query; 

  if (!id) {
    return res.status(400).json({ msg: "Invalid identifier" });
  }

  if (/^\d+$/.test(id)) {
    try {
      const artwork = await fetchClevelandArtById(id);
      res.json(artwork);
    } catch (error) {
      console.error(
        "Error fetching artwork from Cleveland Museum of Art:",
        error.message
      );
      res.status(500).json({
        error: "Failed to fetch artwork from Cleveland Museum of Art",
      });
    }
  } else {
    try {
      const artwork = await fetchVAMArtById(id);
      res.json(artwork);
    } catch (error) {
      console.error("Error fetching artwork from V&A:", error.message);
      res.status(500).json({ error: "Failed to fetch artwork from V&A" });
    }
  }
};

async function fetchClevelandArtById(id) {
  try {
    const response = await axios.get(
      `https://openaccess-api.clevelandart.org/api/artworks/${id}`
    );
    const artwork = response.data.data;

    if (!artwork) {
      throw new Error("Artwork not found");
    }

    return {
      id: artwork.id || "Unknown",
      title: artwork.title || "Untitled",
      artist: artwork.artists_tags
        ? artwork.artists_tags.join(", ")
        : "Unknown",
      img_url: artwork.images?.web?.url || "",
      medium: artwork.medium || "Unknown",
      dimensions: artwork.measurements || "Unknown",
      technique: artwork.technique || "Unknown",
      categories: artwork.categories,
      type: artwork.type,
      artistName: artwork.creators[0].description || "Unknown",
      source: "Cleveland Museum of Art",
    };
  } catch (error) {
    console.error(
      "Error fetching artwork from Cleveland Museum of Art:",
      error.message
    );
    throw error;
  }
}

async function fetchVAMArtById(id) {
  try {
    const response = await axios.get(
      `https://api.vam.ac.uk/v2/object/${id}`
    );
    const artwork = response.data.record;
    const image = response.data.meta.images;

    if (!artwork) {
      throw new Error("Artwork not found in V&A");
    }

    return {
      id: artwork.systemNumber || "Unknown",
      title: artwork.title || "Untitled",
      artist:
        artwork.artist ||
        artwork.artistMakerOrganisations[0].name.text ||
        "Unknown",
      img_url: image._primary_thumbnail || "",
      medium: artwork.materials || "Unknown",
      techniques: artwork.techniques || "Unknown",
      categories: artwork.categories || "Unknown",
      dimensions: artwork.dimensions || "Unknown",
      source: "Victoria and Albert Museum",
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error("Artwork not found in V&A:", id);
      return null;
    }

    console.error("Error fetching artwork from V&A:", error.message);
    throw error;
  }
}
