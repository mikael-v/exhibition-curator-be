const axios = require("axios");

const fetchArtworks = async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  let searchQuery = req.query.search || "";
  let sortBy = req.query.sortBy || "title"; 

  const vamApiUrl = "https://api.vam.ac.uk/v2/objects/search";
  const cmaApiUrl = "https://openaccess-api.clevelandart.org/api/artworks";

  const vamParams = {
    page_size: 100,
    q: searchQuery || "art",
  };

  const cmaParams = {
    limit: 100,
    search: searchQuery || "",
  };

  try {
    const vamResponse = await axios.get(vamApiUrl, { params: vamParams });
    const vamRecords = vamResponse.data.records || [];

    const cmaResponse = await axios.get(cmaApiUrl, { params: cmaParams });
    const cmaRecords = cmaResponse.data.data || [];

    const filteredVamRecords = vamRecords.filter(
      (record) => record._primaryImageId || record._images?.length > 0
    );

    const filteredCmaRecords = cmaRecords.filter(
      (record) => record.images?.web || record.primary_image_url
    );

    const combinedRecords = [...filteredVamRecords, ...filteredCmaRecords];

    const filteredBySearch = combinedRecords.filter((record) => {
      const title = record.title || record._primaryTitle || "";
      const artist =
        record.creators?.[0]?.description ||
        record._primaryMaker?.name ||
        record.artist ||
        record.records?.artistMakerOrganisations?.[0]?.name?.text ||
        "";

      return (
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    const normalizeString = (str) => {
      if (!str) return "";
      return str.replace(/[^\w\s]/gi, ""); 
    };

    if (sortBy === "title") {
      filteredBySearch.sort((a, b) => {
        const titleA = normalizeString(a.title || a._primaryTitle || "");
        const titleB = normalizeString(b.title || b._primaryTitle || "");
        return titleA.localeCompare(titleB);
      });
    } else if (sortBy === "artist") {
      filteredBySearch.sort((a, b) => {
        const artistA = normalizeString(
          a.artist || a.creators?.[0]?.description || ""
        );
        const artistB = normalizeString(
          b.artist || b.creators?.[0]?.description || ""
        );
        return artistA.localeCompare(artistB);
      });
    }

    const totalRecords = filteredBySearch.length;
    const totalPages = Math.ceil(totalRecords / limit);
    const startIndex = (page - 1) * limit;

    if (startIndex >= totalRecords) {
      return res.status(404).json({ msg: "Page number exceeds total pages." });
    }

    const paginatedRecords = filteredBySearch.slice(
      startIndex,
      startIndex + limit
    );

    res.json({
      records: paginatedRecords,
      currentPage: page,
      totalPages: totalPages,
      totalRecords: totalRecords,
    });
  } catch (error) {
    console.error("Error fetching data from APIs:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

module.exports = { fetchArtworks };
