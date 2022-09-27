// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/PrizeDistributor.sol";

contract PrizeDistributorTest is Test {
    uint256 private constant ERC20_SUPPLY = 1000e18;
    bytes32 private constant ROOT = 0x2b45d5fc49a0fbeebcfe25e327710a7bfefa9622b35e8ec2be66471501368245;

    PrizeDistributor private instance;

    function setUp() public {
        // deploy prize distributor contract
        instance = new PrizeDistributor();
        instance.setMerkleRoot(ROOT);
    }

    // Test Contract initial state
    function testInitialStateValues() public {
        assertEq(instance.merkleRoot(), ROOT);
    }

    // Test setMerkleRoot() functionality
    function testMerkleRootUpdateFailureOnlyOwner() public {
        address nonOwnerAddress = vm.addr(5);
        bytes32 newRoot = 0xf89c34fc9f5c549e28574b51e5ffc193014e9f2e9baf96087d4a9fe82d362499;

        vm.expectRevert("Ownable: caller is not the owner");
        vm.prank(nonOwnerAddress);
        instance.setMerkleRoot(newRoot);
    }

    function testMerkleRootUpdateSuccess() public {
        bytes32 newRoot = 0xf89c34fc9f5c549e28574b51e5ffc193014e9f2e9baf96087d4a9fe82d362499;

        instance.setMerkleRoot(newRoot);

        assertEq(instance.merkleRoot(), newRoot);
    }
}
