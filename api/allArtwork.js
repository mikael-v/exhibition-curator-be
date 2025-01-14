const axios = require("axios");

const fetchArtworks = (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
    return res.status(400).send({ msg: "Invalid query parameters" });
  }

  const vamApiUrl = "https://api.vam.ac.uk/v2/objects/search";

  const cmaApiUrl = "https://openaccess-api.clevelandart.org/api/artworks";

  const vamParams = {
    page: page,
    page_size: limit,
    q: "art",
  };

  const cmaParams = {
    page: page,
    limit: limit,
  };

  axios
    .all([
      axios.get(vamApiUrl, { params: vamParams }),
      axios.get(cmaApiUrl, { params: cmaParams }),
    ])
    .then(
      axios.spread((vamResponse, cmaResponse) => {
        const vamData = vamResponse.data;
        const vamRecords = vamData.records;

        const cmaData = cmaResponse.data;
        const cmaRecords = cmaData.data;

        const totalVamPages = vamData.pages || 0;
        const totalCmaPages = Math.ceil(cmaData.info.total / limit);

        const totalPages = Math.max(totalVamPages, totalCmaPages);

        const combinedRecords = [...vamRecords, ...cmaRecords];
        const startIndex = (page - 1) * limit;
        const paginatedRecords = combinedRecords.slice(
          startIndex,
          startIndex + limit
        );

        res.json({
          records: paginatedRecords,
          currentPage: page,
          totalPages: totalPages,
        });

        res.json({
          records: combinedRecords,
          currentPage: page,
          totalPages: totalPages,
        });
      })
    )
    .catch((error) => {
      console.error("Error fetching data from APIs:", error.message);
      res.status(500).json({ error: "Failed to fetch data" });
    });
};

module.exports = { fetchArtworks };
