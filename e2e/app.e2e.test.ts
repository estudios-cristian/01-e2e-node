import request from "supertest";
import createApp from "../src/app";
import { config } from "../src/config/config";
describe("GET /", () => {
  const app = createApp();
  const api = request(app);
  const server = app.listen(3000);
  afterAll(() => {
    server.close();
  });
  test("should return 200 OK", async () => {
    const response = await api.get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Hola mi server en express");
  });
  describe("GET /nueva-ruta", () => {
    test("should return 401", async () => {
      const { status } = await api.get("/nueva-ruta");
      expect(status).toBe(401);
    });
    test("should return 200", async () => {
      const { status } = await api.get("/nueva-ruta").set({
        api: config.apiKey,
      });
      expect(status).toBe(200);
    });
    test("should return 401", async () => {
      const { status } = await api.get("/nueva-ruta").set({
        api: "123",
      });
      expect(status).toBe(401);
    });
  });
});
