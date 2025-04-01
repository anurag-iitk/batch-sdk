import { ethers } from "hardhat";

export async function deployToken(): Promise<string> {
    const tokenName = "Anurag";
    const tokenSymbol = "ANU";
    const tokenDecimals = 18;
    const tokenSupply = ethers.parseUnits("1000000", tokenDecimals);
    const tokenContract = await ethers.deployContract("Token", [tokenName, tokenSymbol, tokenSupply]);
    await tokenContract.waitForDeployment();
    const tokenAddress = await tokenContract.getAddress();

    console.log("Token deployed to:", tokenAddress);

    return tokenAddress;
}

if (require.main === module) {
    deployToken()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 
}
