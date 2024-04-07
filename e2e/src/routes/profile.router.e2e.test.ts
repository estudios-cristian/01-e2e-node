import request from "supertest";
import createApp from "../../../src/app";
import { models } from "../../../src/db/sequelize";
import { upSeed, downSeed } from "../../utils/umzug";

const kyesUser = [
  "id",
  "email",
  "password",
  "recoveryToken",
  "role",
  "createdAt",
];

describe("Test for /profile", () => {
  const app = createApp();
  const api = request(app);
  const server = app.listen(3000);
  const path = "/api/v1/profile";
  beforeAll(async () => {
    await upSeed();
  });
  afterAll(async () => {
    server.close();
    await downSeed();
  });
  describe("GET /my-user", () => {
    let session;
    beforeAll(async () => {
      const inputData = {
        email: "admin@mail.com",
        password: "admin123",
      };
      session = (await api.post(`/api/v1/auth/login`).send(inputData)).body;
    });
    test("should return a 401", async () => {
      const { status } = await api.get(`${path}/my-user`).set({
        authorization: "Bearer token",
      });
      expect(status).toBe(401);
    });
    test("should return a 200", async () => {
      const { status } = await api.get(`${path}/my-user`).set({
        Authorization: `Bearer ${session.access_token}`,
      });
      expect(status).toBe(200);
    });
  });
});
