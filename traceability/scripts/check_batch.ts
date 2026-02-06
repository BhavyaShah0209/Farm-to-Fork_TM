
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x0213d9A3bcF98379a8CCB0e05aCF2cdBECD42684";
  const batchId = "BATCH_1770341011774_996"; // The one from the user's latest log

  const ProduceTraceability = await hre.ethers.getContractFactory("ProduceTraceability");
  const contract = ProduceTraceability.attach(contractAddress);

  console.log(`Checking if batch ${batchId} exists on contract ${contractAddress}...`);

  // Need to read the 'batches' mapping, but it's private.
  // There is a 'getBatch' function though.

  try {
    const result = await contract.getBatch(batchId);
    console.log("✅ Batch Found!");
    console.log("Status:", result[5]); // Status enum
    console.log("Owner:", result[3]);
  } catch (error) {
    console.error("❌ Batch check failed:", error.message);
    // Usually reverts if batch doesn't exist? Check contract code.
    // Sol: require(batchExists(id), "Batch missing");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
