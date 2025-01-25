const app = require("../index.js");
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
        const artworks = response.body.records;
        expect(artworks.length).toBeLessThanOrEqual(20);
      });
  });
});

describe("/api/artworks/:id", () => {
  test("Returns 200 and responds with an artwork with correct properties from Cleveland API", () => {
    return request(app)
      .get("/api/artworks/94979")
      .expect(200)
      .then((response) => {
        const artwork = response.body;
        expect(Object.keys(artwork).length).toBe(9);
      });
  });
  test("Returns 200 and responds withan artwork with correct properties from VAM API", () => {
    return request(app)
      .get("/api/artworks/O614042")
      .expect(200)
      .then((response) => {
        const artwork = response.body;
        expect(Object.keys(artwork).length).toBe(9);
      });
  }),
    test("Returns 400 for invalid query parameters", () => {
      return request(app)
        .get("/api/artworks/nonvalid")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Invalid query parameters");
        });
    });
}),
  describe("/api/users", () => {
    describe("GET /api/users", () => {
      test("Returns 200 and an array of users with correct properties", () => {
        return request(app)
          .get("/api/users")
          .expect(200)
          .then((response) => {
            const users = response.body.users;
            expect(users).toBeInstanceOf(Array);
            expect(users.length).toBeGreaterThan(0);

            users.forEach((user) => {
              expect(user).toHaveProperty("id");
              expect(user).toHaveProperty("name");
              expect(user).toHaveProperty("collections");
            });
          });
      });
    }),
      test("Returns 404 for non-existent user", () => {
        return request(app)
          .get("/api/users/9999/collections")
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe("User not found");
          });
      }),
      test("Returns 200 and an array of collections available at the user endpoint", () => {
        return request(app)
          .get("/api/users/1/collections")
          .then((response) => {
            const collections = response.body.collections;
            expect(Object.keys(collections).length).toBeGreaterThan(0);
          });
      }),
      test("Returns 200 with 'No Collections Found' if user has no collections", () => {
        return request(app)
          .get("/api/users/2/collections")
          .expect(200)
          .then((response) => {
            expect(response.body.msg).toBe("No Collections Found");
          });
      }),
      test("Returns 404 for non-existent collection", () => {
        return request(app)
          .get("/api/users/1/collections/nonExistentCollection")
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe(
              "Collection 'nonExistentCollection' not found"
            );
          });
      }),
      test("Returns 404 for an empty collection", () => {
        return request(app)
          .get("/api/users/1/collections/favorites")
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe("No artwork found in 'favorites'");
          });
      });
  });

describe("POST /api/users/collections", () => {
  test(`should add an artwork to a collection and respond with a 201 status code`, () => {
    const testArtwork = {
      artworkId: 94979,
      title: "Nathaniel Hurd",
      summary:
        "Hurd was a prominent silversmith and engraver in Boston, and the warm gaze and unforced smile in his portrait by Copley suggest the friendship between the two artists. Hurd's open-collared shirt, as well as the rakishly tilted turban that covers his shaved head in place of a ceremonial powdered wig, create an air of informality that is unusual for a portrait of this time.",
      img_url:
        "https://openaccess-cdn.clevelandart.org/1915.534/1915.534_web.jpg",
      medium: "Painting",
      dimensions:
        "Framed: 90.5 x 78 x 6.5 cm (35 5/8 x 30 11/16 x 2 9/16 in.); Unframed: 76.2 x 64.8 cm (30 x 25 1/2 in.)",
      techniques: "oil on canvas",
      artist: "John Singleton Copley (American, 1738–1815)",
      source: "Cleveland Museum of Art",
    };
    return request(app)
      .post("/api/users/1/collections/favorites")
      .send({ artworkId: testArtwork.artworkId })
      .expect(201)
      .then((response) => {
        const artwork = response.body;
        console.log(artwork);
        expect(response.status).toBe(201);
        expect(response.body.msg).toBe(
          `Artwork ${testArtwork.artworkId} added to collection 'favorites'`
        );
        expect(response.body.collection).toContain(testArtwork.artworkId);
      });
  });
  test(`should create a new collection in the user's collection and return with a 201 status code`, () => {
    return request(app)
      .post("/api/users/1/collections")
      .send({ collectionName: "landscapeArt" })
      .expect(201)
      .then((response) => {
        expect(response.body).toMatchObject({
          msg: "Collection 'landscapeArt' created successfully",
          collections: expect.objectContaining({
            landscapeArt: [],
          }),
        });
      });
  });
});
