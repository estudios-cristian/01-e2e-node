import request from "supertest";
import createApp from "../../../src/app";
import { models } from "../../../src/db/sequelize";
import { upSeed, downSeed } from "../../utils/umzug";

describe("Test for /products", () => {
  const app = createApp();
  const api = request(app);
  const server = app.listen(3000);
  const path = "/api/v1/products";
  beforeAll(async () => {
    await upSeed();
  });

  afterAll(async () => {
    server.close();
    await downSeed();
  });

  describe("GET /products", () => {
    test("should return an array", async () => {
      const response = await api.get(path);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].category).toBeDefined();
    });
  });
});
