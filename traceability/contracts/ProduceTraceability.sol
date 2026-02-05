// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ProduceTraceability is Ownable {

    constructor(address initialOwner) Ownable(initialOwner) {}

    enum Status { CREATED, SPLIT, TRANSFERRED, SOLD }

    struct EventLog {
        string action;
        string fromId;
        string toId;
        uint256 timestamp;
    }

    struct QualityCheck {
        string[] pesticidesUsed;      // List of pesticide names/brands
        string[] fertilizersUsed;     // List of fertilizer names/brands
        string[] proofPhotos;         // IPFS hashes of photos (fertilizer bags, receipts, etc.)
        string certificationHash;     // IPFS hash of quality certification document (optional)
        uint256 lastUpdated;          // Timestamp of last quality update
    }

    struct Batch {
        string batchId;
        string parentBatchId;
        uint256 quantity;
        string holderId;
        bytes32 dataHash;
        Status status;
        EventLog[] history;
        QualityCheck qualityData;     // Quality check information
    }

    mapping(string => Batch) private batches;

    function batchExists(string memory id) private view returns (bool) {
        return bytes(batches[id].batchId).length > 0;
    }

    function createBatch(
        string calldata batchId,
        uint256 quantity,
        string calldata farmerId,
        bytes32 dataHash
    ) external onlyOwner {
        require(!batchExists(batchId), "Batch exists");

        Batch storage b = batches[batchId];
        b.batchId = batchId;
        b.quantity = quantity;
        b.holderId = farmerId;
        b.dataHash = dataHash;
        b.status = Status.CREATED;

        // Initialize quality data
        b.qualityData.lastUpdated = block.timestamp;

        b.history.push(
            EventLog("CREATED", farmerId, farmerId, block.timestamp)
        );
    }

    function addQualityCheck(
        string calldata batchId,
        string[] calldata pesticides,
        string[] calldata fertilizers,
        string[] calldata photos,
        string calldata certHash
    ) external onlyOwner {
        require(batchExists(batchId), "Batch missing");

        Batch storage b = batches[batchId];
        
        // Add pesticides
        for (uint i = 0; i < pesticides.length; i++) {
            b.qualityData.pesticidesUsed.push(pesticides[i]);
        }
        
        // Add fertilizers
        for (uint i = 0; i < fertilizers.length; i++) {
            b.qualityData.fertilizersUsed.push(fertilizers[i]);
        }
        
        // Add proof photos (IPFS hashes)
        for (uint i = 0; i < photos.length; i++) {
            b.qualityData.proofPhotos.push(photos[i]);
        }
        
        b.qualityData.certificationHash = certHash;
        b.qualityData.lastUpdated = block.timestamp;

        b.history.push(
            EventLog("QUALITY_CHECK_ADDED", b.holderId, b.holderId, block.timestamp)
        );
    }

    function updateQualityProof(
        string calldata batchId,
        string calldata photoHash
    ) external onlyOwner {
        require(batchExists(batchId), "Batch missing");

        Batch storage b = batches[batchId];
        b.qualityData.proofPhotos.push(photoHash);
        b.qualityData.lastUpdated = block.timestamp;

        b.history.push(
            EventLog("QUALITY_PROOF_UPDATED", b.holderId, b.holderId, block.timestamp)
        );
    }

    function transferBatch(
        string calldata batchId,
        string calldata toId
    ) external onlyOwner {
        require(batchExists(batchId), "Batch missing");

        Batch storage b = batches[batchId];
        string memory from = b.holderId;

        b.holderId = toId;
        b.status = Status.TRANSFERRED;

        b.history.push(
            EventLog("TRANSFERRED", from, toId, block.timestamp)
        );
    }

    function splitBatch(
        string calldata parentId,
        string calldata childId,
        uint256 qty,
        string calldata newHolder,
        bytes32 dataHash
    ) external onlyOwner {
        require(batchExists(parentId), "Parent missing");
        require(!batchExists(childId), "Child exists");

        Batch storage parent = batches[parentId];
        require(parent.quantity >= qty, "Insufficient qty");

        parent.quantity -= qty;
        parent.status = Status.SPLIT;

        Batch storage child = batches[childId];
        child.batchId = childId;
        child.parentBatchId = parentId;
        child.quantity = qty;
        child.holderId = newHolder;
        child.dataHash = dataHash;
        child.status = Status.TRANSFERRED;

        parent.history.push(
            EventLog("SPLIT", parent.holderId, newHolder, block.timestamp)
        );

        child.history.push(
            EventLog("CREATED_FROM_SPLIT", parent.holderId, newHolder, block.timestamp)
        );
    }

    function getBatch(string calldata id)
        external
        view
        returns (
            string memory,
            string memory,
            uint256,
            string memory,
            bytes32,
            Status,
            EventLog[] memory
        )
    {
        require(batchExists(id), "Batch missing");
        Batch storage b = batches[id];
        return (
            b.batchId,
            b.parentBatchId,
            b.quantity,
            b.holderId,
            b.dataHash,
            b.status,
            b.history
        );
    }

    function getQualityCheck(string calldata id)
        external
        view
        returns (
            string[] memory pesticides,
            string[] memory fertilizers,
            string[] memory photos,
            string memory certificationHash,
            uint256 lastUpdated
        )
    {
        require(batchExists(id), "Batch missing");
        Batch storage b = batches[id];
        return (
            b.qualityData.pesticidesUsed,
            b.qualityData.fertilizersUsed,
            b.qualityData.proofPhotos,
            b.qualityData.certificationHash,
            b.qualityData.lastUpdated
        );
    }
}
