pragma solidity ^0.8.20;


contract Traceability {


    enum Role {
        Farmer,
        Shipper,
        Retailer
    }


    struct Batch {

        uint256 batchId;

        string productName;

        address farmerAddress;

        uint256 harvestTimestamp;

        string ipfsHash;
    }


    struct TrackStep {

        address handlerAddress;

        uint256 stepTimestamp;

        string statusDescription;

        Role role;
    }


    mapping(uint256 => Batch) public batches;


    mapping(uint256 => TrackStep[]) public trackingHistory;


    mapping(address => Role) public userRoles;



    event BatchCreated(
        uint256 batchId,
        string productName,
        address farmer
    );


    event TrackStepAdded(
        uint256 batchId,
        string status,
        address handler
    );



    function registerRole(Role _role)
    public
    {
        userRoles[msg.sender] = _role;
    }




    function createBatch(
        uint256 _batchId,
        string memory _productName,
        string memory _ipfsHash
    )
    public
    {

        require(
            userRoles[msg.sender] == Role.Farmer,
            "Only Farmer can create batch"
        );


        require(
            batches[_batchId].batchId == 0,
            "Batch already exists"
        );


        batches[_batchId] = Batch(
            _batchId,
            _productName,
            msg.sender,
            block.timestamp,
            _ipfsHash
        );


        emit BatchCreated(
            _batchId,
            _productName,
            msg.sender
        );
    }





    function addTrackStep(
        uint256 _batchId,
        string memory _status,
        Role _role
    )
    public
    {

        require(
            batches[_batchId].batchId != 0,
            "Batch does not exist"
        );


        require(
            userRoles[msg.sender] == _role,
            "Role not matched"
        );


        trackingHistory[_batchId].push(
            TrackStep(
                msg.sender,
                block.timestamp,
                _status,
                _role
            )
        );


        emit TrackStepAdded(
            _batchId,
            _status,
            msg.sender
        );

    }




    function getBatch(
        uint256 _batchId
    )
    public
    view
    returns(Batch memory)
    {
        return batches[_batchId];
    }




    function getTrackingHistory(
        uint256 _batchId
    )
    public
    view
    returns(TrackStep[] memory)
    {
        return trackingHistory[_batchId];
    }


}