/* eslint-disable no-console */
const request = require("supertest");
const { app } = require("../../TargetService/index");

describe("POST /newTarget", () => {
  let server = null;

  beforeAll(async () => {
    // Connect to the database
    server = app.listen(3012, () => console.log("Listening on port 3015"));
  });
      
  afterAll(async () => {
    server.close();
  });
  it("should create a new target", async () => {
    const target = {targetname: "test", description: "test", location: {coordinates: [0, 0], placename: "test"}};
    const response = await request(app).post("/newTarget").send(target);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("success");
  });
  
});
  
