
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x0213d9A3bcF98379a8CCB0e05aCF2cdBECD42684";

  // Data from your error logs
  const batchId = "BATCH_1770341011774_996";
  const quantity = 10;
  const farmerId = "FARMER_777e660a"; // Aarushee
  const dataHash = hre.ethers.encodeBytes32String("manual_fix");

  console.log(`Manually creating batch ${batchId} on contract...`);

  const ProduceTraceability = await hre.ethers.getContractFactory("ProduceTraceability");
  const contract = ProduceTraceability.attach(contractAddress);

  const tx = await contract.createBatch(batchId, quantity, farmerId, dataHash);
  console.log(`Transaction sent: ${tx.hash}`);

  await tx.wait();
  console.log("✅ Batch successfully created on blockchain!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
