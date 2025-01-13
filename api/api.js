const { endpoints } = require("../endpoints.json");

function getAPIs(req, res, next) {
  res.status(200).send({ endpoints });
}

module.exports = { getAPIs };