import * as chai from "chai";
import { LoginController } from "./LoginController";
import { Cryptography } from "../../cryptography/Cryptography";

class MockAdminUserRepository {
  crpyto = new Cryptography();

  public async getUserIndex() {
    return {
      "test@test.com": { id: 1, email: "test@test.com", password: await this.crpyto.hash("password") },
    };
  }
}

describe("LoginController", () => {
  const controller = new LoginController(
    new MockAdminUserRepository() as any,
    new Cryptography()
  );

  it("returns a token for valid requests", async () => {
    const result = await controller.post({
      username: "test@test.com",
      password: "password"
    }) as any;

    chai.expect(result.data.token).to.not.equal(undefined);
  });

  it("returns a 401 for unknown users", async () => {
    const result = await controller.post({
      username: "test2@test.com",
      password: "password"
    }) as any;

    chai.expect(result.code).to.equal(401);
  });

  it("returns a 401 for incorrect passwords", async () => {
    const result = await controller.post({
      username: "test@test.com",
      password: "derp"
    }) as any;

    chai.expect(result.code).to.equal(401);
  });

});
