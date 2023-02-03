import TestsHelpers from "../tests-helpers";
import models from "../../src/models";

describe("User", () => {
  beforeAll(async () => {
    await TestsHelpers.startDb();
  });

  afterAll(async () => {
    await TestsHelpers.stopDb();
  });

  describe("static methods", () => {
    describe("hashPassword", () => {
      it("should encrypt the password correctly", async () => {
        const { User } = models;
        const password = "Test123#";
        const hashedPassword = await User.hashPassword(password);
        expect(hashedPassword).toEqual(expect.any(String));
        expect(hashedPassword).not.toEqual(password);
      });
    });

    describe("comparePasswords", () => {
      it("should return true if the hashed password is the same as the original one", async () => {
        const { User } = models;
        const password = "Test123#";
        const hashedPassword = await User.hashPassword(password);
        const arePasswordsEqual = await User.comparePasswords(
          password,
          hashedPassword
        );
        expect(arePasswordsEqual).toBe(true);
      });

      it("should return false if the hashed password and the original differ", async () => {
        const { User } = models;
        const password = "Test123#";
        const hashedPassword = await User.hashPassword(password);
        const arePasswordsEqual = await User.comparePasswords(
          "Test123!",
          hashedPassword
        );
        expect(arePasswordsEqual).toBe(false);
      });
    });
  });

  describe("hooks", () => {
    beforeEach(async () => {
      await TestsHelpers.syncDb();
    });

    it("should create a user with a hashed password", async () => {
      const { User } = models;
      const email = "test@example.com";
      const password = "Test123#";
      await User.create({ email, password });
      const users = await User.findAll();
      expect(users.length).toBe(1);
      expect(users[0].email).toEqual(email);
      expect(users[0].password).not.toEqual(password);
    });
  });
});
