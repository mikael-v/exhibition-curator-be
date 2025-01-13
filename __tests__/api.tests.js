const request = require("supertest"); 
require("jest-sorted"); 
const { endpoints } = require("../endpoints.json");

const BASE_URL = "http://localhost:3000"; 

describe("/api", () => {
  test("Returns 200 status code and responds with an array containing the correct properties", async () => {
    jest.setTimeout(10000);
    const response = await request(BASE_URL).get("/api").expect(200);
    const result = response.body.endpoints;
    const expected = endpoints;
    expect(result).toEqual(expected);
  });
});

describe("/api/artwork", () => {
  test("Returns 200 and responds with an array of artworks with correct properties", async () => {
    const response = await request(BASE_URL)
      .get("/api/artwork?page=1&limit=10") 
      .expect(200);

    const artworks = response.body.records; 
    expect(artworks.length).toBeLessThanOrEqual(10); 
    artworks.forEach((artwork) => {
      expect(artwork).toHaveProperty("id");
      expect(artwork).toHaveProperty("title");
      expect(artwork).toHaveProperty("artist");
      expect(artwork).toHaveProperty("img_url");
    });
  });
});

describe("/api/artwork/:id", () => {
  test("Returns 200 and responds with an artwork object with correct properties", async () => {
    const response = await request(BASE_URL)
      .get("/api/artwork?id=O1013211") // Use `?id=O1013211` for serverless
      .expect(200);

    const artwork = response.body;
    expect(artwork).toMatchObject({
      id: "O1013211",
      title: "Untitled",
      artist: "Heussner & Co",
      img_url:
        "https://framemark.vam.ac.uk/collections/2016JK6699/full/!100,100/0/default.jpg",
      medium: [
        {
          text: "pencil",
          id: "x30347",
        },
        {
          text: "ink",
          id: "AAT15012",
        },
        {
          text: "watercolour",
          id: "x33202",
        },
      ],
      techniques: [
        {
          text: "drawing",
          id: "x32498",
        },
      ],
      categories: [
        {
          text: "Wall coverings",
          id: "THES48878",
        },
        {
          text: "Designs",
          id: "THES48968",
        },
        {
          text: "Drawings",
          id: "THES48966",
        },
      ],
      dimensions: [],
      source: "Victoria and Albert Museum",
    });
  });
});
