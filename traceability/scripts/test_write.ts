
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x0213d9A3bcF98379a8CCB0e05aCF2cdBECD42684";
  console.log(`Connecting to contract at ${contractAddress}...`);

  const ProduceTraceability = await hre.ethers.getContractFactory("ProduceTraceability");
  const contract = ProduceTraceability.attach(contractAddress);

  // Send a transaction to create a batch
  console.log("sending createBatch transaction...");
  const tx = await contract.createBatch(
    "TEST_BATCH_" + Math.floor(Math.random() * 1000), // unique-ish ID
    100, // quantity
    "FARMER_TEST", // farmerId
    hre.ethers.encodeBytes32String("test_hash") // dataHash
  );

  console.log(`Transaction sent! Hash: ${tx.hash}`);
  await tx.wait();
  console.log("Transaction confirmed on blockchain! ✅");
  console.log("Check the 'Transactions' tab in Tenderly now.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
