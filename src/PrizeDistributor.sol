// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "openzeppelin/utils/cryptography/MerkleProof.sol";
import "openzeppelin/access/Ownable.sol";
import "openzeppelin/security/ReentrancyGuard.sol";
import "openzeppelin/token/ERC20/IERC20.sol";
import "./interfaces/IPrizeDistributor.sol";

contract PrizeDistributor is IPrizeDistributor, ReentrancyGuard, Ownable {
    bytes32 public merkleRoot;
    mapping(bytes32 => mapping(address => bool)) public isClaimed;

    /**
     * @notice Sets merkel root
     * @param _merkleRoot new merkel root to be set
     * @dev Only admin addresses allowed
     */
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    /**
     * @notice Claims available prize
     * @param _account Account address
     * @param _token ERC20 token contract address
     * @param _amount Token amount
     * @param _proof Sibling hashes on the branch from the leaf to the root of the merkel tree
     */
    function claim(
        address _account,
        address _token,
        uint256 _amount,
        bytes32[] calldata _proof
    ) external nonReentrant {
        require(_account == msg.sender, "Incorrect account");
        require(!isClaimed[merkleRoot][_account], "Prize is already claimed");
        require(
            MerkleProof.verify(_proof, merkleRoot, keccak256(abi.encodePacked(_account, _token, _amount))),
            "Verification failed"
        );

        isClaimed[merkleRoot][_account] = true;

        // We assume contract has enough balance of ERC20 token to transfer
        require(IERC20(_token).transfer(_account, _amount), "Failed to withdraw");
    }
}
