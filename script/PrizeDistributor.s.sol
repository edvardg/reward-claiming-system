// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/PrizeDistributor.sol";

contract Deploy is Script {
    function run() external returns (PrizeDistributor instance) {
        vm.startBroadcast();

        instance = new PrizeDistributor{salt: vm.envBytes32("SALT")}();

        vm.stopBroadcast();
    }
}
