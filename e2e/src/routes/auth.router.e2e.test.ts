import request from "supertest";
import createApp from "../../../src/app";
import { models } from "../../../src/db/sequelize";

import { upSeed, downSeed } from "../../utils/seed";

describe("Test for /users", () => {
  const app = createApp();
  const api = request(app);
  const server = app.listen(3001);
  const path = "/api/v1/auth";
  beforeAll(async () => {
    await upSeed();
  });
  afterAll(async () => {
    server.close();
    await downSeed();
  });
  describe("POST /login", () => {
    test("should return a 401", async () => {
      const inputData = {
        email: "asdadas@asdasd.com",
        password: "123456",
      };
      const response = await api.post(`${path}/login`).send(inputData);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        statusCode: 401,
        error: "Unauthorized",
        message: "Unauthorized",
      });
    });
    test("should return a 200", async () => {
      const inputData = {
        email: "admin@mail.com",
        password: "admin123",
      };
      const user = (await models.User.findOne({
        where: {
          email: inputData.email,
        },
      })) as unknown as any;

      const { status, body } = await api.post(`${path}/login`).send(inputData);
      expect(status).toBe(200);
      expect(body.access_token).toBeDefined();
      expect(body.user.id).toBe(user.id);
      expect(body.user.email).toBe(user.email);
      expect(body.user.role).toBe(user.role);
      expect(body.user.createdAt).toBe(user.createdAt.toISOString());
      expect(body.user.password).toBeUndefined();
    });
  });
});
