const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow Contract Tests", function () {
  let escrow;
  let owner, client, attacker, freelancer;
  const PRICE = ethers.parseEther("1");
  const DEADLINE = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

  beforeEach(async function () {
    [owner, client, attacker, freelancer] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy();
    await escrow.waitForDeployment();
  });

  it("Should create a project", async function () {
    await escrow.connect(client).createProject("Test", "Details", DEADLINE, PRICE);
    expect(await escrow.projectCount()).to.equal(1);
  });

  it("Should allow client to deposit", async function () {
    await escrow.connect(client).createProject("Test", "Details", DEADLINE, PRICE);
    await escrow.connect(client).deposit(1, { value: PRICE });
    const project = await escrow.projects(1);
    expect(project.state).to.equal(1); // Funded
  });

  it("Should NOT allow attacker to deposit", async function () {
    await escrow.connect(client).createProject("Test", "Details", DEADLINE, PRICE);
    await expect(
      escrow.connect(attacker).deposit(1, { value: PRICE })
    ).to.be.revertedWith("Only client");
  });

  it("Should NOT allow deposit with insufficient funds", async function () {
    await escrow.connect(client).createProject("Test", "Details", DEADLINE, PRICE);
    const insufficient = ethers.parseEther("0.5");
    await expect(
      escrow.connect(client).deposit(1, { value: insufficient })
    ).to.be.revertedWith("Not enough ETH");
  });

  it("Should complete full escrow flow", async function () {
    // Create
    await escrow.connect(client).createProject("Project", "Details", DEADLINE, PRICE);
    // Deposit
    await escrow.connect(client).deposit(1, { value: PRICE });
    let project = await escrow.projects(1);
    expect(project.state).to.equal(1);
    // Publish
    await escrow.connect(client).publish(1);
    project = await escrow.projects(1);
    expect(project.state).to.equal(2);
    // Assign Freelancer
    await escrow.connect(client).selectFreelancer(1, freelancer.address);
    project = await escrow.projects(1);
    expect(project.state).to.equal(3);
    // Release
    await escrow.connect(client).release(1);
    project = await escrow.projects(1);
    expect(project.state).to.equal(4);
  });

  it("Should be secure against reentrancy attacks", async function () {
    const AttackerFactory = await ethers.getContractFactory("Attacker");
    const attackerContract = await AttackerFactory.connect(attacker).deploy();
    await attackerContract.waitForDeployment();
    
    await escrow.connect(client).createProject("Reentrancy Test", "Test", DEADLINE, PRICE);
    await escrow.connect(client).deposit(1, { value: PRICE });
    await escrow.connect(client).publish(1);
    
    await escrow.connect(client).selectFreelancer(1, await attackerContract.getAddress());
    
    const balanceBefore = await ethers.provider.getBalance(await attackerContract.getAddress());
    
    await escrow.connect(client).release(1);
    
    const balanceAfter = await ethers.provider.getBalance(await attackerContract.getAddress());
    
    console.log("Balance before:", ethers.formatEther(balanceBefore));
    console.log("Balance after:", ethers.formatEther(balanceAfter));
    
    expect(balanceAfter - balanceBefore).to.equal(PRICE);
    
    await expect(
        escrow.connect(client).release(1)
    ).to.be.revertedWith("Not assigned");
  });
});