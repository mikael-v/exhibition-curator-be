const app = require("../app.js");
const request = require("supertest");
require("jest-sorted");
const { endpoints } = require("../endpoints.json");

describe("/api", () => {
  test("Returns 200 status code and responds with array containing the correct properties ", () => {
    jest.setTimeout(10000);
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        const result = response.body.endpoints;
        const expected = endpoints;
        expect(result).toEqual(expected);
      });
  });
});

describe("/api/artworks", () => {
  test("Returns 200 and responds with an array of artworks with correct properties", () => {
    return request(app)
      .get("/api/artworks?page=1&limit=10")
      .expect(200)
      .then((response) => {
        const artworks = response.body.artworks;
        expect(artworks.length).toBeLessThanOrEqual(20);
      });
  });
  test("Returns 400 for invalid query parameters", () => {
    return request(app)
      .get("/api/artworks?page=abc&limit=xyz")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid query parameters");
      });
  });
});

describe("/api/artworks/:id", () => {
  test("Returns 200 and responds with an artwork with correct properties", () => {
    return request(app)
      .get("/api/artworks/5")
      .expect(200)
      .then((response) => {
        const artwork = response.body;
        expect(Object.keys(artwork).length).toBe(57);
      });
  });
  test("Returns 400 for invalid query parameters", () => {
    return request(app)
      .get("/api/artworks/nonevalid")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Invalid query parameters");
      });
  });
});