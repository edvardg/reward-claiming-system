// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface IPrizeDistributor {
    function setMerkleRoot(bytes32 merkleRoot) external;

    function claim(
        address,
        address,
        uint256,
        bytes32[] calldata
    ) external;
}
