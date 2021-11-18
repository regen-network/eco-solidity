// We import Chai to use its asserting functions here.
const { expect } = require("chai");

describe("Token contract", function () {
  let Token;
  let rb1;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("RegenBasket");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    rb1 = await Token.deploy(owner.address, "rg1", "RG1", 9);
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(await rb1.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await rb1.balanceOf(owner.address);
      expect(await rb1.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {

    beforeEach(async function() {
      await rb1.mint(owner.address, "1000", "0x1231")
    });

    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await rb1.transfer(addr1.address, 50);
      const addr1Balance = await rb1.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await rb1.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await rb1.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await rb1.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        rb1.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await rb1.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await rb1.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1.
      await rb1.transfer(addr1.address, 500);

      // Transfer another 50 tokens from owner to addr2.
      await rb1.connect(addr1).transfer(addr2.address, 300);

      // Check balances.
      const finalOwnerBalance = await rb1.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - 500);

      const addr1Balance = await rb1.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(200);

      const addr2Balance = await rb1.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(300);
    });
  });
});
