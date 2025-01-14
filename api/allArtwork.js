const axios = require("axios");

const fetchArtworks = async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
    return res.status(400).send({ msg: "Invalid query parameters" });
  }

  const vamApiUrl = "https://api.vam.ac.uk/v2/objects/search";
  const cmaApiUrl = "https://openaccess-api.clevelandart.org/api/artworks";

  const vamParams = {
    page_size: 100, 
    q: "art", 
  };

  const cmaParams = {
    limit: 100, 
  };

  try {
    const vamResponse = await axios.get(vamApiUrl, { params: vamParams });
    const vamRecords = vamResponse.data.records || [];

    const cmaResponse = await axios.get(cmaApiUrl, { params: cmaParams });
    const cmaRecords = cmaResponse.data.data || [];

    const combinedRecords = [...vamRecords, ...cmaRecords];
    const totalRecords = combinedRecords.length;
    const totalCombinedPages = Math.ceil(totalRecords / limit);

    const startIndex = (page - 1) * limit;

    if (startIndex >= totalRecords) {
      return res.status(404).json({ msg: "Page number exceeds total pages." });
    }

    const paginatedRecords = combinedRecords.slice(
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
