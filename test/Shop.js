// We import Chai to use its asserting functions here.
const { expect } = require("chai");

describe("Shop contract", function () {
  let Token;
  let Shop;
  let rb1;
  let shop;
  let owner;
  let treasury;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("RegenBasket");
    Shop = await ethers.getContractFactory("Shop");
    [owner, treasury, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    rb1 = await Token.deploy(owner.address, "rg1", "RG1", 9);
    shop = await Shop.deploy(owner.address, treasury.address);
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    it("Should set right contract parameters", async function () {
      expect(await shop.owner()).equal(owner.address);
      expect(await shop.treasury()).equal(treasury.address);
    });
  });
});
