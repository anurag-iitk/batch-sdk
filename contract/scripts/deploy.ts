import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { getSelectors, FacetCutAction } from "./libraries/diamond";
import { Signer, Interface } from "ethers";

// Deploy Diamond Contracts
export async function deployDiamond(): Promise<string> {
    const accounts: Signer[] = await ethers.getSigners();
    const contractOwner: Signer = accounts[0];

    // Deploy DiamondCutFacet
    const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
    const diamondCutFacet = await DiamondCutFacet.deploy();
    await diamondCutFacet.waitForDeployment();
    console.log("DiamondCutFacet deployed:", await diamondCutFacet.getAddress());

    // Deploy Diamond
    const Diamond = await ethers.getContractFactory("Diamond");
    const diamond = await Diamond.deploy(
        await contractOwner.getAddress(),
        await diamondCutFacet.getAddress()
    );
    await diamond.waitForDeployment();
    console.log("Diamond deployed:", await diamond.getAddress());

    // Deploy DiamondInit
    const DiamondInit = await ethers.getContractFactory("DiamondInit");
    const diamondInit = await DiamondInit.deploy();
    await diamondInit.waitForDeployment();
    console.log("DiamondInit deployed:", await diamondInit.getAddress());

    // Deploy Facets
    console.log("\nDeploying facets");
    const FacetNames: string[] = [
        "DiamondLoupeFacet",
        "OwnershipFacet",
        "BatchFacet"
    ];

    const cut: {
        facetAddress: string;
        action: FacetCutAction;
        functionSelectors: string[];
    }[] = [];

    for (const FacetName of FacetNames) {
        const Facet = await ethers.getContractFactory(FacetName);
        const facet = await Facet.deploy();
        await facet.waitForDeployment();
        console.log(`${FacetName} deployed:`, await facet.getAddress());
        cut.push({
            facetAddress: await facet.getAddress(),
            action: FacetCutAction.Add,
            functionSelectors: getSelectors(facet),
        });
    }

    // Upgrade Diamond with facets
    console.log("\nDiamond Cut:", cut);
    const diamondAddress = await diamond.getAddress();
    const diamondCut = await ethers.getContractAt("IDiamondCut", diamondAddress);
    const diamondInitAddress = await diamondInit.getAddress();
    const diamondInitInterface: Interface = diamondInit.interface;

    // Call to init function
    const functionCall: string = diamondInitInterface.encodeFunctionData("init", []);
    const tx = await diamondCut.diamondCut(cut, diamondInitAddress, functionCall);
    console.log("Diamond cut tx:", tx.hash);
    const receipt = await tx.wait();
    if (!receipt || !receipt.status) {
        throw new Error(`Diamond upgrade failed: ${tx.hash}`);
    }
    console.log("Completed diamond cut");
    return diamondAddress;
}

// Recommended pattern to handle async/await and errors
if (require.main === module) {
    deployDiamond()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
