import request from "supertest";
import TestHelpers from "../../tests-helpers";
import models from "../../../src/models";

describe("login", () => {
  let app;
  let newUserResponse;

  beforeAll(async () => {
    await TestHelpers.startDb();
    app = TestHelpers.getApp();
  });

  afterAll(async () => {
    await TestHelpers.stopDb();
  });

  beforeEach(async () => {
    await TestHelpers.syncDb();
    newUserResponse = await TestHelpers.registerNewUser({
      email: "test@example.com",
      password: "Test123#",
    });
  });

  it("should login a user successfully and store the refresh token", async () => {
    const response = await request(app)
      .post("/v1/login")
      .send({ email: "test@example.com", password: "Test123#" })
      .expect(200);
    const refreshToken = response.body.data.refreshToken;
    const { RefreshToken } = models;
    const savedRefreshToken = await RefreshToken.findOne({
      where: { token: refreshToken },
    });
    expect(savedRefreshToken).toBeDefined();
    expect(savedRefreshToken.token).toEqual(refreshToken);
  });

  it("should return 401 if the user is not found", async () => {
    const response = await request(app)
      .post("/v1/login")
      .send({ email: "invalid.user@example.com", password: "Test123#" })
      .expect(401);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("Invalid credentials");
  });

  it("should return 401 if the password is invalid", async () => {
    const response = await request(app)
      .post("/v1/login")
      .send({ email: "test@example.com", password: "Test123!" })
      .expect(401);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("Invalid credentials");
  });

  it("should return the same refresh token if the user is already longin", async () => {
    const response = await request(app)
      .post("/v1/login")
      .send({ email: "test@example", password: "Test123#" })
      .expect(200);
    expect(response.body.data.refreshToken).toEqual(
      newUserResponse.body.data.refreshToken
    );
  });

  it("should create a new refresh token record if there is not one already", async () => {
    const { RefreshToken } = models;
    await RefreshToken.destroy({ where: {} });
    let refreshTokens = await RefreshToken.findAll();
    expect(refreshTokens.length).toEqual(0);
    await request(app)
      .post("/v1/login")
      .send({ email: "test@example", password: "Test123#" })
      .expect(200);
    refreshTokens = await RefreshToken.findAll();
    expect(refreshTokens.length).toEqual(1);
    expect(refreshTokens[0].token).not.toBeNull();
  });

  it("should set the token field to a jwt if this field is empty", async () => {
    const { RefreshToken } = models;
    const refreshToken = newUserResponse.body.data.refreshToken;
    const savedRefreshToken = await RefreshToken.findOne({
      where: { token: refreshToken },
    });
    savedRefreshToken.token = null;
    await savedRefreshToken.save();
    await request(app)
      .post("/v1/login")
      .send({ email: "test@example", password: "Test123#" })
      .expect(200);
    await savedRefreshToken.reload();
    expect(savedRefreshToken.token).not.toBeNull();
  });
});
