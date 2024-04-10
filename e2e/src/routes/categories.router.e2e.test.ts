import request from "supertest";
import createApp from "../../../src/app";
import { models } from "../../../src/db/sequelize";
import { upSeed, downSeed } from "../../utils/umzug";

describe("test for /categories path", () => {
  const app = createApp();
  const api = request(app);
  const server = app.listen(3000);
  const path = "/api/v1/categories";
  beforeAll(async () => {
    await upSeed();
  });
  afterAll(async () => {
    server.close();
    await downSeed();
  });

  describe("POST /categories with admin user", () => {
    let session: { access_token: string };
    beforeAll(async () => {
      const inputData = {
        email: "admin@mail.com",
        password: "admin123",
      };
      session = (await api.post(`/api/v1/auth/login`).send(inputData)).body;
    });
    test("should return 401", async () => {
      const user = (await models.User.findByPk("1")) as any;
      const inputData = {
        name: "category",
        image: "image",
      };
      const { statusCode } = await api.post(`${path}`).send(inputData);
      expect(statusCode).toEqual(401);
    });
    test("should return a new category", async () => {
      const inputData = {
        name: "category",
        image: "https://image.com/image.jpg",
      };
      const { statusCode, body } = await api
        .post(`${path}`)
        .set({
          Authorization: `Bearer ${session?.access_token}`,
        })
        .send(inputData);
      const category = (await models.Category.findByPk(body.id)) as any;
      expect(statusCode).toEqual(201);
      expect(category?.name).toEqual(inputData.name);
      expect(category?.image).toEqual(inputData.image);
    });
  });
  describe("POST /categories with customer user", () => {
    let session: { access_token: string };
    beforeAll(async () => {
      const inputData = {
        email: "customer@mail.com",
        password: "admin123",
      };
      session = (await api.post(`/api/v1/auth/login`).send(inputData)).body;
    });
    test("should return 401 for not image valid", async () => {
      const inputData = {
        name: "category",
        image: "image",
      };
      const { statusCode } = await api.post(`${path}`).send(inputData);
      expect(statusCode).toEqual(401);
    });
    test("should return 401 for not valide user", async () => {
      const inputData = {
        name: "category",
        image: "image",
      };
      const { statusCode, body } = await api
        .post(`${path}`)
        .set({
          Authorization: `Bearer ${session?.access_token}`,
        })
        .send(inputData);
      console.log(body);

      expect(statusCode).toEqual(401);
      expect(body).toEqual({
        statusCode: 401,
        error: "Unauthorized",
        message: "your role is not allow",
      });
    });
  });
});
