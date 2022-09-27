const { ethers } = require('ethers');
const { bytecode } = require('../out/PrizeDistributor.sol/PrizeDistributor.json');
require('dotenv').config();

// Contract Factory address - it is the same for all networks
const factoryAddress = '0x4e59b44847b379578588920cA78FbF26c0B4956C';
const salt = process.env.SALT;

const create2Address = (senderAddress, saltHex, initCode) => {
    return ethers.utils.getCreate2Address(senderAddress, saltHex, ethers.utils.keccak256(initCode));
}

const run = (factoryAddress, salt) => {
    const saltHex = ethers.utils.id(salt);

    const address = create2Address(factoryAddress, saltHex, bytecode.object);
    console.log('address: ', address);
}

run(factoryAddress, salt);
