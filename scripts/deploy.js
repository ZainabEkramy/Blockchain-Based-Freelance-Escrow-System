const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);
    
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();
    
    await escrow.waitForDeployment();
    
    const contractAddress = await escrow.getAddress();
    console.log("Escrow deployed to:", contractAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });