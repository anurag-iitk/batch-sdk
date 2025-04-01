import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const gasReportPath = path.resolve(__dirname, "./gas-report.txt");
if (fs.existsSync(gasReportPath)) {
  fs.unlinkSync(gasReportPath);
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    holesky: {
      url: process.env.RPC_PROVIDER,
      accounts: [process.env.SIGNER_PRIVATE_KEY as string],
      chainId: 17000,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "ETH",
    gasPrice: 20,
    coinmarketcap: process.env.COIN_MARKETCAP_API_KEY || "",
    outputFile: "gas-report.txt",
    noColors: true,
  },
};

export default config;
