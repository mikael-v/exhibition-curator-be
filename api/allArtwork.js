const axios = require("axios");

const fetchArtworks = async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  let searchQuery = req.query.search || "";

  if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
    return res.status(400).send({ msg: "Invalid query parameters" });
  }

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

    const totalRecords = filteredBySearch.length;
    const totalCombinedPages = Math.ceil(totalRecords / limit);

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
      totalPages: totalCombinedPages,
      totalRecords: totalRecords,
    });
  } catch (error) {
    console.error("Error fetching data from APIs:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

module.exports = { fetchArtworks };
