import request from "supertest";
import createApp from "../../../src/app";
import { models } from "../../../src/db/sequelize";

import { upSeed, downSeed } from "../../utils/umzug";

const mockSendMail = jest.fn();

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockImplementation(() => ({
    sendMail: mockSendMail,
  })),
}));

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

  describe("POST /recovery", () => {
    beforeAll(() => {
      jest.clearAllMocks();
    });
    test("should return a 401", async () => {
      const inputData = {
        email: "sdasd@fakeemail.com",
      };
      const { status } = await api.post(`${path}/recovery`).send(inputData);
      expect(status).toBe(401);
    });
    test("should send mail", async () => {
      const user = await models.User.findOne({
        where: {
          id: 1,
        },
      });
      if (!user) throw new Error("User not found");
      const inputData = {
        email: user.get("email") as string,
      };
      mockSendMail.mockResolvedValue(true);
      const { status, body } = await api
        .post(`${path}/recovery`)
        .send(inputData);
      expect(status).toBe(200);
      expect(body.message).toBe("mail sent");
      expect(mockSendMail).toHaveBeenCalledTimes(1);
    });
  });
});
