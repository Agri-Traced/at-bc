// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgriTrace {

    struct Batch {

        uint256 id;
        string product_name;
        address farmer_address;
        uint256 timestamp;
        string ipfs_hash_certificates;
        string status_step;

    }


    uint256 private batchCounter;


    mapping(uint256 => Batch) public batches;


    event BatchCreated(
        uint256 id,
        string product_name,
        address farmer,
        uint256 timestamp
    );


    function createBatch(
        string memory _name,
        string memory _ipfs
    )
    public
    returns(uint256)
    {

        batchCounter++;


        batches[batchCounter] = Batch(

            batchCounter,
            _name,
            msg.sender,
            block.timestamp,
            _ipfs,
            "Created"

        );


        emit BatchCreated(
            batchCounter,
            _name,
            msg.sender,
            block.timestamp
        );


        return batchCounter;

    }

    function getBatch(uint256 _id)
    public
    view
    returns(Batch memory)
    {

        return batches[_id];

    }
    
function getBatchCount() public view returns (uint256) {
    return batchCounter;
}
function updateStatus(uint256 _id, string memory _status) public {
    batches[_id].status_step = _status;
}
}