import request from "supertest";
import createApp from "../../../src/app";
import { models } from "../../../src/db/sequelize";

const kyesUser = [
  "id",
  "email",
  "password",
  "recoveryToken",
  "role",
  "createdAt",
];

describe("Test for /users", () => {
  const app = createApp();
  const api = request(app);
  const server = app.listen(3001);
  const path = "/api/v1/users";
  afterEach(() => {
    server.close();
  });
  describe("POST /users", () => {
    test("should return 400 Bad Request", async () => {
      const failedInputsData = [
        {
          email: "",
          password: "123456",
          errorMessage: "Email",
        },
        {
          email: "pruebas@gmail.com",
          password: "",
          errorMessage: "Email",
        },
        {
          email: "",
          password: "",
          errorMessage: ["Email", "Password"],
        },
      ];

      await Promise.all(
        failedInputsData.map(async (inputData) => {
          const response = await api.post(path).send(inputData);
          expect(response.status).toBe(400);
        })
      );
    });
    test("should return 409 Created", async () => {
      const response = await api.post(path).send({
        email: "admin@mail.com",
        password: "admin123",
      });
      expect(response.status).toBe(409);
    });
  });
  describe("GET /users", () => {
    test("should return 200 OK", async () => {
      const response = await api.get(path);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });
  });
  describe("GET /users/:id", () => {
    test("should return 404 Not Found", async () => {
      const response = await api.get(`${path}/999999`);
      expect(response.status).toBe(404);
    });
    test("should return an user", async () => {
      const user = await models.User.findByPk("1");
      const response = await api.get(`${path}/1`);
      response.body.createdAt = new Date(response.body.createdAt);

      if (user) {
        kyesUser.forEach((key) => {
          expect(user[key]).toBeDefined();
          expect(user[key]).toEqual(response.body[key]);
        });
      }
      expect(response.status).toBe(200);
      response.body.createdAt = new Date(response.body);

      const date = new Date(response.body.createdAt);
      expect(date).toBeInstanceOf(Date);
      expect(date).not.toBe("Invalid Date");

      //  role: 'admin',
      // createdAt: '2024-04-01T17:27:34.107Z'
    });
  });
});
