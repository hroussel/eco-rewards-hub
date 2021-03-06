import * as chai from "chai";
import { OrganisationView } from "./OrganisationView";
import { SchemeView } from "../scheme/SchemeView";

describe("OrganisationView", () => {
  const view = new OrganisationView(
    {
      1: { id: 1, name: "scheme", vac_client_id: 155 },
      2: { id: 2, name: "scheme2", vac_client_id: 155 }
    },
    new SchemeView()
  );

  it("creates a JSON view from a model", async () => {
    const actual = await view.create({}, {
      id: 1,
      name: "org",
      scheme_id: 2
    });

    chai.expect(actual.id).to.equal("/organisation/" + 1);
    chai.expect(actual.name).to.equal("org");
    chai.expect(actual.scheme).to.equal("/scheme/" + 2);
  });

  it("populates the links object", async () => {
    const links = {};
    const actual = await view.create(links, {
      id: 1,
      name: "org",
      scheme_id: 2
    });

    chai.expect(links["/scheme/1"]).to.equal(undefined);
    chai.expect(links["/scheme/2"].name).to.equal("scheme2");
  });

});
