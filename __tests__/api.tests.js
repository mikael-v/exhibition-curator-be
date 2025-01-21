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
