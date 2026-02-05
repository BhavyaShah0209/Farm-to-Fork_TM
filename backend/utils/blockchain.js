const { ethers } = require('ethers');

// Contract Address from your deployment
const contractAddress = process.env.CONTRACT_ADDRESS || "0xdb544459eebf51ee30d45c278d0b1a8c628c7947";

// ========== COMPLETE ABI WITH EVENTS ==========
const contractABI = [
  // Events - These will be visible in Tenderly!
  "event BatchCreated(string indexed batchId, string farmerId, uint256 quantity, bytes32 dataHash, uint256 timestamp)",
  "event BatchTransferred(string indexed batchId, string fromId, string toId, uint256 timestamp)",
  "event BatchSplit(string indexed parentBatchId, string indexed childBatchId, uint256 parentRemainingQty, uint256 childQuantity, string newHolder, uint256 timestamp)",
  "event BatchStatusChanged(string indexed batchId, uint8 oldStatus, uint8 newStatus)",
  
  // Functions
  "function createBatch(string calldata batchId, uint256 quantity, string calldata farmerId, bytes32 dataHash) external",
  "function transferBatch(string calldata batchId, string calldata toId) external",
  "function splitBatch(string calldata parentId, string calldata childId, uint256 qty, string calldata newHolder, bytes32 dataHash) external",
  "function getBatch(string calldata id) external view returns (string memory, string memory, uint256, string memory, bytes32, uint8, tuple(string action, string fromId, string toId, uint256 timestamp)[] memory)",
  "function owner() external view returns (address)"
];

let provider;
let wallet;
let contract;

/**
 * Initialize blockchain connection to Tenderly testnet
 */
const initBlockchain = () => {
  try {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    
    if (!rpcUrl) {
      console.warn("⚠️  BLOCKCHAIN_RPC_URL not found. Blockchain features disabled.");
      return;
    }

    // Connect to Tenderly testnet
    provider = new ethers.JsonRpcProvider(rpcUrl);
    console.log("✅ Connected to Tenderly Testnet:", rpcUrl);

    // Setup wallet for write operations
    if (process.env.PRIVATE_KEY) {
      wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      contract = new ethers.Contract(contractAddress, contractABI, wallet);
      console.log("✅ Blockchain Connected with Wallet:", wallet.address);
      console.log("📝 Contract Address:", contractAddress);
    } else {
      // Read-only mode
      contract = new ethers.Contract(contractAddress, contractABI, provider);
      console.log("⚠️  Blockchain Connected (Read-Only) - No PRIVATE_KEY found");
    }

  } catch (error) {
    console.error("❌ Failed to initialize blockchain:", error.message);
  }
};

/**
 * Create a new batch on the blockchain
 * @param {string} batchId - Unique batch identifier
 * @param {number} quantity - Amount of produce
 * @param {string} farmerId - Farmer's ID
 * @param {string} dataHash - IPFS hash or encrypted data hash
 * @returns {Promise<Object>} Transaction receipt
 */
const createBatch = async (batchId, quantity, farmerId, dataHash) => {
  if (!contract) throw new Error("Blockchain not initialized");
  
  try {
    console.log(`\n🌾 Creating batch on blockchain...`);
    console.log(`   Batch ID: ${batchId}`);
    console.log(`   Farmer ID: ${farmerId}`);
    console.log(`   Quantity: ${quantity}`);
    
    // Convert data hash to bytes32 format
    const bytes32Hash = ethers.encodeBytes32String(dataHash.substring(0, 31));
    
    const tx = await contract.createBatch(batchId, quantity, farmerId, bytes32Hash);
    console.log(`📤 Transaction sent: ${tx.hash}`);
    console.log(`🔗 Tenderly: https://dashboard.tenderly.co/tx/${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Batch created in block ${receipt.blockNumber}`);
    
    // Parse events from receipt
    const events = receipt.logs.map(log => {
      try {
        return contract.interface.parseLog(log);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    
    console.log(`📋 Events emitted:`, events.map(e => e.name));
    
    return { receipt, events, txHash: tx.hash };
  } catch (error) {
    console.error("❌ Error creating batch:", error.message);
    throw error;
  }
};

/**
 * Transfer batch to a new holder
 * @param {string} batchId - Batch to transfer
 * @param {string} toId - New holder ID
 * @returns {Promise<Object>} Transaction receipt
 */
const transferBatch = async (batchId, toId) => {
  if (!contract) throw new Error("Blockchain not initialized");
  
  try {
    console.log(`\n🔄 Transferring batch: ${batchId} to ${toId}`);
    
    const tx = await contract.transferBatch(batchId, toId);
    console.log(`📤 Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Transfer completed in block ${receipt.blockNumber}`);
    
    return { receipt, txHash: tx.hash };
  } catch (error) {
    console.error("❌ Error transferring batch:", error.message);
    throw error;
  }
};

/**
 * Split a batch into a child batch
 * @param {string} parentId - Parent batch ID
 * @param {string} childId - New child batch ID
 * @param {number} quantity - Amount to split
 * @param {string} newHolder - Who receives the child batch
 * @param {string} dataHash - Metadata hash
 * @returns {Promise<Object>} Transaction receipt
 */
const splitBatch = async (parentId, childId, quantity, newHolder, dataHash) => {
  if (!contract) throw new Error("Blockchain not initialized");
  
  try {
    console.log(`\n✂️  Splitting batch: ${parentId}`);
    console.log(`   Child ID: ${childId}`);
    console.log(`   Quantity: ${quantity}`);
    console.log(`   New Holder: ${newHolder}`);
    
    const bytes32Hash = ethers.encodeBytes32String(dataHash.substring(0, 31));
    
    const tx = await contract.splitBatch(parentId, childId, quantity, newHolder, bytes32Hash);
    console.log(`📤 Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Split completed in block ${receipt.blockNumber}`);
    
    return { receipt, txHash: tx.hash };
  } catch (error) {
    console.error("❌ Error splitting batch:", error.message);
    throw error;
  }
};

/**
 * Get batch details from blockchain
 * @param {string} batchId - Batch ID to query
 * @returns {Promise<Object>} Batch details
 */
const getBatch = async (batchId) => {
  if (!contract) throw new Error("Blockchain not initialized");
  
  try {
    const result = await contract.getBatch(batchId);
    
    return {
      batchId: result[0],
      parentBatchId: result[1],
      quantity: Number(result[2]),
      holderId: result[3],
      dataHash: result[4],
      status: Number(result[5]),
      history: result[6].map(event => ({
        action: event.action,
        fromId: event.fromId,
        toId: event.toId,
        timestamp: Number(event.timestamp)
      }))
    };
  } catch (error) {
    console.error("❌ Error fetching batch:", error.message);
    throw error;
  }
};

/**
 * Listen to blockchain events in real-time
 * Useful for monitoring farmer registrations and posts
 */
const setupEventListeners = () => {
  if (!contract) {
    console.warn("⚠️  Cannot setup listeners - contract not initialized");
    return;
  }
  
  // Listen for BatchCreated events
  contract.on("BatchCreated", (batchId, farmerId, quantity, dataHash, timestamp, event) => {
    console.log("\n🎉 NEW BATCH CREATED EVENT:");
    console.log(`   Batch ID: ${batchId}`);
    console.log(`   Farmer ID: ${farmerId}`);
    console.log(`   Quantity: ${quantity.toString()}`);
    console.log(`   Timestamp: ${new Date(Number(timestamp) * 1000).toISOString()}`);
    console.log(`   Tx Hash: ${event.log.transactionHash}`);
    console.log(`   Block: ${event.log.blockNumber}`);
  });
  
  // Listen for BatchTransferred events
  contract.on("BatchTransferred", (batchId, fromId, toId, timestamp) => {
    console.log("\n🔄 BATCH TRANSFERRED EVENT:");
    console.log(`   Batch ID: ${batchId}`);
    console.log(`   From: ${fromId} → To: ${toId}`);
  });
  
  // Listen for BatchSplit events
  contract.on("BatchSplit", (parentId, childId, parentQty, childQty, newHolder) => {
    console.log("\n✂️  BATCH SPLIT EVENT:");
    console.log(`   Parent: ${parentId} → Child: ${childId}`);
    console.log(`   Child Quantity: ${childQty.toString()}`);
    console.log(`   New Holder: ${newHolder}`);
  });
  
  console.log("👂 Event listeners activated!");
};

const getContract = () => contract;
const getProvider = () => provider;
const getWallet = () => wallet;

module.exports = { 
  initBlockchain, 
  getContract, 
  getProvider,
  getWallet,
  createBatch,
  transferBatch,
  splitBatch,
  getBatch,
  setupEventListeners
};