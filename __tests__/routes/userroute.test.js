/* eslint-disable no-console */
const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../AuthenticationService/Models/User");
const { jwtOptions , app } = require("../../AuthenticationService/index");

describe("POST /login", () => {
  let server = null;
  beforeAll(async () => {
    // Connect to the database
    server = app.listen(3015, () => console.log("Listening on port 3000"));
  });

  afterAll(async () => {
    server.close();
  });

  it("returns a token for valid credentials", async () => {
    // Create a mock user with valid credentials
    const user = {
      username: "testuser",
      password: "test",
    };
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const mockUser = {
      username: user.username,
      password: hashedPassword,
      uid: "123",
      role: "user",
    };
    jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
    // Send a request with the mock user's credentials
    const response = await request(app)
      .post("/login")
      .send(user);

    // Verify that the response contains a token
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");

    // Verify that the token can be decoded and contains the expected payload
    const decodedToken = jwt.verify(response.body.token, jwtOptions.secretOrKey);
    expect(decodedToken.uid).toBe(mockUser.uid);
    expect(decodedToken.username).toBe(mockUser.username);
    expect(decodedToken.role).toBe(mockUser.role);
  });

  it("returns an error message for invalid credentials", async () => {
    // Create a mock user with invalid credentials
    const user = {
      username: "testuser",
      password: "invalidpassword",
    };
    const hashedPassword = await bcrypt.hash("correctpassword", 10);
    const mockUser = {
      username: user.username,
      password: hashedPassword,
      uid: "123",
      role: "user",
    };
    jest.spyOn(User, "findOne").mockResolvedValue(mockUser);

    // Send a request with the mock user's invalid credentials
    const response = await request(app)
      .post("/login")
      .send(user);

    // Verify that the response contains an error message
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("message", "Username or password is incorrect");
  });
});
