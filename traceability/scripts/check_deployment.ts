
const hre = require("hardhat");

async function main() {
  const address = "0x0213d9A3bcF98379a8CCB0e05aCF2cdBECD42684";
  console.log(`Checking code at ${address}...`);
  const code = await hre.ethers.provider.getCode(address);

  if (code === "0x") {
    console.log("❌ No contract found at this address.");
  } else {
    console.log("✅ Contract detected! Bytecode length:", code.length);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
