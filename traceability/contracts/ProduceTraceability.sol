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

    struct Batch {
        string batchId;
        string parentBatchId;
        uint256 quantity;
        string holderId;
        bytes32 dataHash;
        Status status;
        EventLog[] history;
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

        b.history.push(
            EventLog("CREATED", farmerId, farmerId, block.timestamp)
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
}
