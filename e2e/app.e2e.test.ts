import request from "supertest";
import createApp from "../src/app";

describe("GET /", () => {
  const app = createApp();
  const api = request(app);
  const server = app.listen(3000);
  afterEach(() => {
    server.close();
  });
  test("should return 200 OK", async () => {
    const response = await api.get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Hola mi server en express");
  });
});
