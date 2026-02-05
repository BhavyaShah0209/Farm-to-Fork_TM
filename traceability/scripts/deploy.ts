import { ethers, tenderly } from "hardhat";

async function main() {
  console.log("Deploying ProduceTraceability contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const ProduceTraceability = await ethers.getContractFactory("ProduceTraceability");
  
  console.log("Deploying contract...");
  const contract = await ProduceTraceability.deploy();
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log("✅ ProduceTraceability deployed to:", address);

  // Verify the contract on Tenderly
  console.log("Verifying contract on Tenderly...");
  await tenderly.verify({
    name: "ProduceTraceability",
    address: address,
  });
  
  console.log("✅ Contract verified on Tenderly!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });