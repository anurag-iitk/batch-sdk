import { ethers } from "hardhat";
import { expect, assert } from "chai";
import { SelectorCollection, getSelectors, FacetCutAction, removeSelectors, findAddressPositionInFacets } from "../scripts/libraries/diamond";
import { deployDiamond } from "../scripts/deploy";
import { deployToken } from "../scripts/deployToken";

describe("Diamond Test", function () {
    let diamondAddress: string;
    let diamondCutFacet: any;
    let diamondLoupeFacet: any;
    let ownershipFacet: any;
    let batchFacet: any;
    const addresses: any = []
    let tokenAddress: any;
    let tokenContract: any;
    let user: any;
    let recipient1: any;
    let recipient2: any;
    let recipient3: any;
    let owner: any;


    before(async function () {
        const accounts = await ethers.getSigners();
        owner = accounts[0];
        user = accounts[1];
        recipient1 = accounts[2];
        recipient2 = accounts[3];
        recipient3 = accounts[4];

        diamondAddress = await deployDiamond();
        tokenAddress = await deployToken();

        diamondCutFacet = await ethers.getContractAt("DiamondCutFacet", diamondAddress);
        diamondLoupeFacet = await ethers.getContractAt("DiamondLoupeFacet", diamondAddress);
        ownershipFacet = await ethers.getContractAt("OwnershipFacet", diamondAddress);
        batchFacet = await ethers.getContractAt("BatchFacet", diamondAddress);
        tokenContract = await ethers.getContractAt("Token", tokenAddress);
    });

    it('should have eight facets -- call to facetAddresses function', async () => {
        for (const address of await diamondLoupeFacet.facetAddresses()) {
            addresses.push(address)
        }

        assert.equal(addresses.length, 4)
    })

    it('selectors should be associated to facets correctly -- multiple calls to facetAddress function', async () => {
        assert.equal(
            addresses[0],
            await diamondLoupeFacet.facetAddress('0x1f931c1c')
        )
        assert.equal(
            addresses[1],
            await diamondLoupeFacet.facetAddress('0xcdffacc6')
        )
        assert.equal(
            addresses[1],
            await diamondLoupeFacet.facetAddress('0x01ffc9a7')
        )
        assert.equal(
            addresses[2],
            await diamondLoupeFacet.facetAddress('0xf2fde38b')
        )
    })

    it("Should transfer single ETH", async () => {
        const amount = ethers.parseEther("1");

        const tx = batchFacet.connect(user).batchTransfer(
            [{
                tokenAddress: ethers.ZeroAddress,
                recipient: recipient1.address,
                amount: amount
            }],
            { value: amount }
        )
        await expect(tx)
            .to.emit(batchFacet, "BatchExecuted")
            .withArgs(user.address, 1, amount, 0);
    });

    it("Should transfer multiple ETH", async () => {
        const amount1 = ethers.parseEther("0.5");
        const amount2 = ethers.parseEther("1.5");
        const total = amount1 + amount2;

        const tx = await batchFacet.connect(user).batchTransfer(
            [
                { tokenAddress: ethers.ZeroAddress, recipient: recipient1.address, amount: amount1 },
                { tokenAddress: ethers.ZeroAddress, recipient: recipient2.address, amount: amount2 }
            ],
            { value: total }
        );

        await expect(tx)
            .to.emit(batchFacet, "BatchExecuted")
            .withArgs(user.address, 2, total, 0);
    });

    it("Should revert on incorrect ETH value", async () => {
        const amount = ethers.parseEther("1");

        await expect(
            batchFacet.connect(user).batchTransfer(
                [{ tokenAddress: ethers.ZeroAddress, recipient: recipient1.address, amount: amount }],
                { value: amount - ethers.parseEther("1") }
            )
        ).to.be.revertedWith("ETH transfer failed");
    });

    it("Should transfer single ERC20", async () => {
        const amount = ethers.parseEther("100");
        await tokenContract.connect(owner).approve(diamondAddress, amount);
        const tx = await batchFacet.connect(owner).batchTransfer([
            {
                tokenAddress: tokenAddress,
                recipient: recipient1.address,
                amount: ethers.parseEther("10")
            }
        ]);
        await expect(tx)
            .to.emit(batchFacet, "BatchExecuted")
            .withArgs(owner.address, 1, 0, 1);
    });

    it("Should transfer multiple ERC20s", async () => {
        const amount1 = ethers.parseEther("10");
        const amount2 = ethers.parseEther("20");
        const tx = batchFacet.connect(owner).batchTransfer([
            { tokenAddress: tokenAddress, recipient: recipient1.address, amount: amount1 },
            { tokenAddress: tokenAddress, recipient: recipient2.address, amount: amount2 }
        ])
        await expect(tx)
            .to.emit(batchFacet, "BatchExecuted")
            .withArgs(owner.address, 2, 0, 2);
    });

    it("Should handle ETH and ERC20 together", async () => {
        const ethAmount = ethers.parseEther("1");
        const tokenAmount = ethers.parseEther("10");
        const tx =
            batchFacet.connect(owner).batchTransfer(
                [
                    { tokenAddress: ethers.ZeroAddress, recipient: recipient1.address, amount: ethAmount },
                    { tokenAddress: tokenAddress, recipient: recipient2.address, amount: tokenAmount }
                ],
                { value: ethAmount }
            )

        await expect(tx)
            .to.emit(batchFacet, "BatchExecuted")
            .withArgs(owner.address, 2, ethAmount, 1);
    });
});