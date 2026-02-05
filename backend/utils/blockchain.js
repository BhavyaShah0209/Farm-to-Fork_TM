const { ethers } = require('ethers');

// Need ABI and Contract Address
// Note: You will need to provide the actual ABI json file or object and the deployed contract address
// const contractABI = require('../config/ContractABI.json'); 
const contractAddress = process.env.CONTRACT_ADDRESS;

// Placeholder ABI just to show structure (Replace with actual)
const contractABI = [
  "function createBatch(string memory _batchId, string memory _farmerId, string memory _cropData) public",
  "function getBatchDetails(string memory _batchId) public view returns (string memory, string memory, string memory)"
];

let provider;
let wallet;
let contract;

const initBlockchain = () => {
  try {
    if (!process.env.BLOCKCHAIN_RPC_URL) {
      console.warn("Blockchain RPC URL not found. Blockchain features might not work.");
      return;
    }

    provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);

    // For write operations, we need a wallet/signer (Backend wallet)
    if (contractAddress && process.env.PRIVATE_KEY) {
      wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      contract = new ethers.Contract(contractAddress, contractABI, wallet);
      console.log("Blockchain Connected with Wallet");
    } else if (contractAddress) {
      // Read-only
      contract = new ethers.Contract(contractAddress, contractABI, provider);
      console.log("Blockchain Connected (Read-Only)");
    } else {
      console.warn("Contract Address missing. Blockchain features disabled.");
    }

  } catch (error) {
    console.error("Failed to initialize blockchain connection:", error.message);
  }
};

const getContract = () => contract;
const getProvider = () => provider;

module.exports = { initBlockchain, getContract, getProvider };
