// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "openzeppelin/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20("MockToken", "MTK") {
    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}
