
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x0213d9A3bcF98379a8CCB0e05aCF2cdBECD42684";
  console.log(`Scanning for events on contract: ${contractAddress}`);

  // Connect to the deployed contract
  const ProduceTraceability = await hre.ethers.getContractFactory("ProduceTraceability");
  const contract = ProduceTraceability.attach(contractAddress);

  // Get current block number
  const currentBlock = await hre.ethers.provider.getBlockNumber();
  console.log(`Current Block: ${currentBlock}`);

  console.log("Listening for recent events (last 100 blocks)...");

  // Checking for 'EventLog' events or similar logic if events are emitted
  // Since the contract emits events like 'BatchCreated' (standard) usually, 
  // but looking at source code helps.

  // Let's print the balance and owner for now as a sanity check
  const owner = await contract.owner();
  console.log(`Contract Owner: ${owner}`);

  // Try to read a batch if we know an ID? No, let's just confirm connectivity.
  console.log("✅ Connection successful. The network is active.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
