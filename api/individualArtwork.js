const axios = require("axios");

function fetchArtworkById(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ msg: "Invalid identifier" });
  }

  if (/^\d+$/.test(id)) {
    fetchClevelandArtById(id)
      .then((artwork) => {
        res.json(artwork);
      })
      .catch((error) => {
        console.error(
          "Error fetching artwork from Cleveland Museum of Art:",
          error.message
        );
        res.status(500).json({
          error: "Failed to fetch artwork from Cleveland Museum of Art",
        });
      });
  } else {
    fetchVAMArtById(id)
      .then((artwork) => {
        res.json(artwork);
      })
      .catch((error) => {
        console.error("Error fetching artwork from V&A:", error.message);
        res.status(500).json({ error: "Failed to fetch artwork from V&A" });
      });
  }
}

function fetchClevelandArtById(id) {
  return axios
    .get(`https://openaccess-api.clevelandart.org/api/artworks/${id}`)
    .then((response) => {
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
        artist: artwork.creators[0].description || "Unknown",
        source: "Cleveland Museum of Art",
      };
    })
    .catch((error) => {
      console.error(
        "Error fetching artwork from Cleveland Museum of Art:",
        error.message
      );
      throw error;
    });
}

function fetchVAMArtById(id) {
  return axios
    .get(`https://api.vam.ac.uk/v2/object/${id}`)
    .then((response) => {
      const artwork = response.data.record;
      const image = response.data.meta.images;
      if (!artwork) {
        throw new Error("Artwork not found in V&A");
      }

      return {
        id: artwork.systemNumber || "Unknown",
        title: artwork.title || artwork.titles[0].title || "Untitled",
        artist:
          artwork.artist ||
          artwork.artistMakerPerson?.[0]?.name?.text ||
          "Unknown",
        img_url: artwork.images?._primary_thumbnail || "",
        medium: artwork.materials || "Unknown",
        techniques: artwork.techniques || "Unknown",
        categories: artwork.categories || "Unknown",
        dimensions: artwork.dimensions || "Unknown",
        source: "Victoria and Albert Museum",
      };
    })
    .catch((error) => {
      if (error.response && error.response.status === 404) {
        console.error("Artwork not found in V&A:", id);
        return null;
      }

      console.error("Error fetching artwork from V&A:", error.message);
      throw error;
    });
}

module.exports = { fetchArtworkById };
