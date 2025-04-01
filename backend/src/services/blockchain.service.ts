import { ethers } from 'ethers';
import config from '../config/index.ts';
import log from '../utils/logger.ts';
import BatchAbi from '../abis/Batch.json' with { type: "json" };

class BlockchainService {
    private provider: ethers.InfuraProvider;
    private signer: ethers.Wallet;
    private diamondContract: ethers.Contract;

    constructor() {
        // Initialize Infura provider
        this.provider = new ethers.InfuraProvider(
            config.infura.network,
            config.infura.apiKey
        );

        // Initialize signer
        this.signer = new ethers.Wallet(
            process.env.SIGNER_PRIVATE_KEY!,
            this.provider
        );

        // Initialize contract
        this.diamondContract = new ethers.Contract(
            config.contracts.diamondAddress,
            BatchAbi,
            this.signer
        );
    }

    // async getGasPrice() {
    //     const gasPrice = await this.getGasPrice();
    //       return gasPrice.mul(2); // Add 100% buffer
    // }

    async executeBatchTransfer(transfers: Array<{
        tokenAddress: string;
        recipient: string;
        amount: string;
    }>): Promise<ethers.TransactionResponse> {
        try {
            const tx = await this.diamondContract.batchTransfer(transfers, {
                value: this.calculateTotalETH(transfers),
                // gasPrice: await this.getGasPrice(),
                gasLimit: 500000
            });

            await tx.wait();
            return tx;
        } catch (error) {
            log.Error('Batch transfer failed', error);
            throw new Error('Failed to execute batch transfer');
        }
    }

    private calculateTotalETH(transfers: any[]): bigint {
        return transfers.reduce((sum, transfer) => {
            if (transfer.tokenAddress === ethers.ZeroAddress) {
                // Convert the transfer amount to bigint, assuming it's in the smallest unit (e.g., Wei)
                return sum + BigInt(transfer.amount); // changed to BigInt and +
            }
            return sum;
        }, BigInt(0));
    }
    
}

export default new BlockchainService();