-include .env

.PHONY: all test clean

all: clean remove install update build

# Clean the repo
clean :; forge clean

# Remove modules
remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules

install :; forge install OpenZeppelin/openzeppelin-contracts --no-commit && forge install foundry-rs/forge-std --no-commit

# Update Dependencies
update :; forge update

build :; forge build

test :; forge test

snapshot :; forge snapshot

slither :; forge flatten src/PrizeDistributor.sol > flattened.sol && slither flattened.sol; rm -rf flattened.sol

format :; prettier --write src/*/*.sol && prettier --write test/*.sol && prettier --write script/*.sol

# solhint should be installed globally
lint :; solhint src/*/*.sol && solhint test/*.sol && solhint script/*.sol

deploy :; @forge script script/PrizeDistributor.s.sol:Deploy --rpc-url ${RPC_URL} --private-key ${PRIVATE_KEY} --broadcast --verify --etherscan-api-key ${ETHERSCAN_API_KEY}  -vvvv
