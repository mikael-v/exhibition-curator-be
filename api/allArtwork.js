const axios = require("axios");

module.exports = async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
    return res.status(400).send({ msg: "Invalid query parameters" });
  }

  const vamApiUrl = "https://api.vam.ac.uk/v2/objects/search";
  const cmaApiUrl = "https://openaccess-api.clevelandart.org/api/artworks";

  const vamParams = { page, page_size: limit, q: "art" };
  const cmaParams = { page, limit };

  try {
    const [vamResponse, cmaResponse] = await Promise.all([
      axios.get(vamApiUrl, { params: vamParams }),
      axios.get(cmaApiUrl, { params: cmaParams }),
    ]);

    const vamData = vamResponse.data.records;
    const cmaData = cmaResponse.data.data;

    const combinedRecords = [...vamData, ...cmaData];

    res.json({ records: combinedRecords, currentPage: page });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};