require("dotenv").config();

const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ket noi blockchain
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
);

// abi contract
const abi = [
    {
        "inputs":[
            {"internalType":"uint256","name":"_id","type":"uint256"},
            {"internalType":"string","name":"_status","type":"string"}
        ],
        "name":"updateStatus",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },
    {
        "inputs":[
            {"internalType":"string","name":"_name","type":"string"},
            {"internalType":"string","name":"_ipfs","type":"string"}
        ],
        "name":"createBatch",
        "outputs":[{"internalType":"uint256","type":"uint256"}],
        "stateMutability":"nonpayable",
        "type":"function"
    },
    {
        "inputs":[{"internalType":"uint256","name":"","type":"uint256"}],
        "name":"batches",
        "outputs":[
            {"internalType":"uint256","name":"id","type":"uint256"},
            {"internalType":"string","name":"product_name","type":"string"},
            {"internalType":"address","name":"farmer_address","type":"address"},
            {"internalType":"uint256","name":"timestamp","type":"uint256"},
            {"internalType":"string","name":"ipfs_hash_certificates","type":"string"},
            {"internalType":"string","name":"status_step","type":"string"}
        ],
        "stateMutability":"view",
        "type":"function"
    },
    {
        "inputs":[],
        "name":"getBatchCount",
        "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
        "stateMutability":"view",
        "type":"function"
    }
];
console.log("RPC:", process.env.RPC_URL);
console.log("CONTRACT:", process.env.CONTRACT_ADDRESS);
// ket noi contract
const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    abi,
    wallet
);

// tao batch
app.post("/api/blockchain/sync", async (req, res) => {
       console.log(req.headers);
    console.log(req.body);

    try {

        const { product_name, ipfs } = req.body;

        if (!product_name || !ipfs) {
            return res.status(400).json({
                success: false,
                error: "thieu du lieu"
            });
        }

        const tx = await contract.createBatch(product_name, ipfs);
        await tx.wait();

        res.status(201).json({
            success: true,
            transactionHash: tx.hash
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// lay batch theo id
app.get("/api/blockchain/batch/:id", async (req, res) => {
    try {

        const batch = await contract.batches(req.params.id);

        res.status(200).json({
            id: batch.id.toString(),
            product_name: batch.product_name,
            farmer: batch.farmer_address,
            timestamp: batch.timestamp.toString(),
            certificate: batch.ipfs_hash_certificates,
            status: batch.status_step
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// dem batch
app.get("/api/blockchain/count", async (req, res) => {
     console.log("COUNT API RUN");

    try {

        const count = Number(await contract.getBatchCount());

        res.status(200).json({
            totalBatch: count
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// tim theo ten san pham
app.get("/api/blockchain/product/:name", async (req, res) => {
    try {

        const name = req.params.name;
        const count = Number(await contract.getBatchCount());

        let result = [];

        for (let i = 1; i <= count; i++) {
            const batch = await contract.batches(i);

            if (batch.product_name === name) {
                result.push({
                    id: batch.id.toString(),
                    product_name: batch.product_name,
                    farmer: batch.farmer_address,
                    timestamp: batch.timestamp.toString(),
                    certificate: batch.ipfs_hash_certificates,
                    status: batch.status_step
                });
            }
        }

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
app.put("/api/blockchain/status/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.body.status;

        const tx = await contract.updateStatus(id, status);
        await tx.wait();

        res.json({
            success: true,
            transactionHash: tx.hash
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// chay server
app.listen(3000, () => {
    console.log("server port 3000");
});
