import keccak256 from 'keccak256';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { MerkleTree } from 'merkletreejs';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/src/signers';

describe('PrizeDistributor::claim()', () => {
    let prizeDistributor: Contract;
    let mockERC20: Contract;
    let signers: SignerWithAddress[];
    let tree: MerkleTree;
    let leafNodes: string[];
    let root: string;
    const supply = ethers.utils.parseUnits('100');

    const buf2hex = (x: Buffer) => '0x' + x.toString('hex');

    const initialize = async (erc20TokenAddress: string): Promise<void> => {
        const signerAccounts = await ethers.getSigners();

        // get [1 => 9] signer accounts to contract merkel tree leaves
        // @ts-ignore
        signers = signerAccounts.slice(1, 9);

        // construct leaves: <accountAddress, tokenAddress, tokenAmount>
        const items = signers.map((signer, index: number) => {
            const amount = ethers.utils.parseUnits((index + 1).toString()).toString();
            return {
                account: signer.address,
                token: erc20TokenAddress,
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [amount])
            }
        })

        leafNodes = items.map((item) =>
            buf2hex(keccak256(
                Buffer.concat([
                    Buffer.from(item.account.replace('0x', ''), 'hex'),
                    Buffer.from(item.token.replace('0x', ''), 'hex'),
                    Buffer.from(item.amount.replace('0x', ''), 'hex'),
                ])
            ))
        );

        tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
        root = buf2hex(tree.getRoot());
    };

    before(async () => {
        const PrizeDistributor = await ethers.getContractFactory('PrizeDistributor');
        prizeDistributor = await PrizeDistributor.deploy();

        const MockERC20 = await ethers.getContractFactory('MockERC20');
        mockERC20 = await MockERC20.deploy();
        mockERC20.mint(prizeDistributor.address, supply);

        // Initialize merkel tree, accounts and signers
        await initialize(mockERC20.address);

        prizeDistributor.setMerkleRoot(root);
    });

    it('Should be initializes with correct merkel root', async () => {
        expect(await prizeDistributor.merkleRoot()).to.equal(root);
    });

    it('Should fail to claim if the caller is wrong address', async () => {
        const proof = tree.getHexProof(leafNodes[0]);

        await expect(
            prizeDistributor.claim(
                // treeAccounts[0],
                signers[0].address,
                mockERC20.address,
                ethers.utils.parseUnits('1'),
                proof
            )
        ).to.be.revertedWith('Incorrect caller');
    });

    it('Should fail to claim if the prize is already claimed', async () => {
        const proof = tree.getHexProof(leafNodes[0]);

        await prizeDistributor.connect(signers[0]).claim(
            // treeAccounts[0],
            signers[0].address,
            mockERC20.address,
            ethers.utils.parseUnits('1'),
            proof
        );

        expect(await prizeDistributor.isClaimed(root, signers[0].address)).to.equal(true);

        await expect(
            prizeDistributor.connect(signers[0]).claim(
                // treeAccounts[0],
                signers[0].address,
                mockERC20.address,
                ethers.utils.parseUnits('1'),
                proof
            )
        ).to.be.revertedWith('Prize is already claimed');
    });

    it('Should fail to claim any of the inputs is incorrect', async () => {
        // wrong amount case
        const proof = tree.getHexProof(leafNodes[1]);
        const wrongAmount = ethers.utils.parseUnits('5'); // specified wrong amount, should be 2

        await expect(
            prizeDistributor.connect(signers[1]).claim(
                signers[1].address,
                mockERC20.address,
                wrongAmount,
                proof
            )
        ).to.be.revertedWith('Verification failed');

        // wrong token address case
        await expect(
            prizeDistributor.connect(signers[2]).claim(
                signers[2].address,
                signers[7].address, // wrong token address
                ethers.utils.parseUnits('5'),
                proof
            )
        ).to.be.revertedWith('Verification failed');
    });

    it('Should successfully claim prize', async () => {
        // account 2 successfully claims and receives amount
        let proof = tree.getHexProof(leafNodes[2]);
        let amount = ethers.utils.parseUnits('3');

        let contractBalanceBefore = await mockERC20.balanceOf(prizeDistributor.address);
        let accountBalanceBefore = await mockERC20.balanceOf(signers[2].address);

        await prizeDistributor.connect(signers[2]).claim(
            signers[2].address,
            mockERC20.address,
            amount,
            proof
        );

        let contractBalanceAfter = await mockERC20.balanceOf(prizeDistributor.address);
        let accountBalanceAfter = await mockERC20.balanceOf(signers[2].address);

        expect(
            ethers.utils.parseUnits(accountBalanceAfter.toString(), 'wei')
                .sub(ethers.utils.parseUnits(accountBalanceBefore.toString(), 'wei'))
        ).to.equal(amount);

        expect(
            ethers.utils.parseUnits(contractBalanceBefore.toString(), 'wei')
                .sub(ethers.utils.parseUnits(contractBalanceAfter.toString(), 'wei'))
        ).to.equal(amount);

        expect(await prizeDistributor.isClaimed(root, signers[2].address)).to.equal(true);


        // account 6 successfully claims and receives amount
        proof = tree.getHexProof(leafNodes[6]);
        amount = ethers.utils.parseUnits('7');

        contractBalanceBefore = await mockERC20.balanceOf(prizeDistributor.address);
        accountBalanceBefore = await mockERC20.balanceOf(signers[6].address);

        await prizeDistributor.connect(signers[6]).claim(
            signers[6].address,
            mockERC20.address,
            amount,
            proof
        );

        contractBalanceAfter = await mockERC20.balanceOf(prizeDistributor.address);
        accountBalanceAfter = await mockERC20.balanceOf(signers[6].address);

        expect(
            ethers.utils.parseUnits(accountBalanceAfter.toString(), 'wei')
                .sub(ethers.utils.parseUnits(accountBalanceBefore.toString(), 'wei'))
        ).to.equal(amount);

        expect(
            ethers.utils.parseUnits(contractBalanceBefore.toString(), 'wei')
                .sub(ethers.utils.parseUnits(contractBalanceAfter.toString(), 'wei'))
        ).to.equal(amount);

        expect(await prizeDistributor.isClaimed(root, signers[6].address)).to.equal(true);
    });
});
