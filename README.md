
# Batch SDK

## Smart Contract
This contract is implemented using the Diamond Proxy Pattern, enabling modularity and flexibility for future enhancements. The design allows for efficient upgrades and extensions while maintaining optimal performance for batch transactions.

This smart contract is designed to facilitate batch payments, allowing the distribution of tokens to multiple recipients in a single blockchain transaction. By leveraging this contract, tokens are seamlessly split and transferred to the specified recipients without the need for an intermediary.

The contract enables peer-to-peer (P2P), non-custodial transactions, where the payer can send tokens to multiple payees simultaneously, offering an efficient and decentralized solution for batch transfers.

To optimize gas efficiency, the smart contract does not perform additional checks, such as verifying the payer's token balance or ensuring sufficient allowances. These checks are inherently part of the ERC-20 token transaction process and can be validated by the application layer beforehand. The application can leverage read-only methods (e.g., balanceOf, allowance) to verify the necessary conditions without incurring any gas fees. If the required conditions are not met, the target token contract will automatically revert the transaction with an appropriate failure message.

### Running the Smart Contract Application
* Navigate to the contract directory:
    
    ```cd contract```

* Install the required dependencies:

    ```npm i ```

* Rename the .env.example file to .env and add your configuration settings in the .env file.

* Compile the smart contract:

    ```npx hardhat compile```

* Deploy the smart contract to a public network or localhost:

    ```npx hardhat run scripts/deploy.ts --network Network_NAME```

* Run the smart contract test cases:

    ```npx hardhat test```

### Running the Backend Server
The backend server includes APIs that communicate with the smart contract.
* Navigate o the backend directory:

    ```cd backend```
* Install the required dependencies:

    ```npm i ```

* Rename the .env.example file to .env and add your configuration settings in the .env file.
* Run the application:
    ```npm run dev```
* The application will now be running on localhost at port 3000.
* Access the Swagger API documentation by opening this URL in your browser: http://localhost:3000/api-doc


