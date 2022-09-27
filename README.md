## Description

The project represents a Smart Contract handles reward claiming. 

The list of prizes are submitted by contract owner in the form of merkle root to the Smart Contract. A "prize" is the concatenation of a player address, an ERC20 token address, and an amount.
Players claim prizes by submitting the aforementioned information, as well as a merkle proof that the corresponding prize is included in the merkle root.

## Project Main Structure
This is the project main structure:
* src
* lib
* script
* test
* utils


* *src* directory contains the project Smart Contracts.
* *lib* directory contains publicly available libraries (written in Solidity) used in the project Smart Contracts.
* *script* directory contains Smart Contract deployer script (written in Solidity).
* *test* directory contains unit tests for Smart Contracts written in both: Solidity (Foundry) and Typescript (Hardhat) languages.
* *utils* contains utility scripts/functionalities. There you can find a script to pre-determine the Smart Contract address for all networks (Create2 is used to determine the contract address).


#### A local *.env* file should be created with environment variables from *.env.template*


## Makefile Commands

* *make install* - Installs all related libraries.
* *make build* - Builds the Smart Contracts.
* *make test* - Executes Foundry unit tests for Smart Contracts.
* *hardhat test* - Executes Hardhat unit tests for Smart Contracts.
* *make slither* - Executes *slither* tool to parse the flattened version of Smart Contracts and make a quick audit.
* *make format* - Parses and formats Smart Contracts.
* *make lint* - Parses and notifies about possible issues in Smart Contracts.
* *make deploy* - Deploys and verifies Smart Contract to the specified network.



