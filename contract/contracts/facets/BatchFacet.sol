// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract BatchFacet {
    event BatchExecuted(
        address indexed sender,
        uint256 totalTransfers,
        uint256 ethTransferred,
        uint256 tokenTransfers
    );

    struct TokenTransfer {
        address tokenAddress; // address(0) for ETH
        address recipient;
        uint256 amount;
    }

    /**
     * @notice Execute a batch transfer of both ETH and ERC-20 tokens in a single transaction
     * @param transfers Array of TokenTransfer structs containing transfer details
     * @dev For ETH transfers, set tokenAddress to address(0)
     * @dev Requires approval for ERC-20 token transfers
     */
    function batchTransfer(
        TokenTransfer[] calldata transfers
    ) external payable {
        uint256 ethTransferred;
        uint256 tokenTransfers;
        
        for (uint i = 0; i < transfers.length; i++) {
            TokenTransfer calldata transfer = transfers[i];
            
            if (transfer.tokenAddress == address(0)) {
                // Handle ETH transfer
                (bool success, ) = transfer.recipient.call{value: transfer.amount}("");
                require(success, "ETH transfer failed");
                ethTransferred += transfer.amount;
            } else {
                // Handle ERC-20 transfer
                IERC20 token = IERC20(transfer.tokenAddress);
                require(
                    token.transferFrom(msg.sender, transfer.recipient, transfer.amount),
                    "ERC-20 transfer failed"
                );
                tokenTransfers++;
            }
        }

        // Verify the correct ETH amount was sent
        require(msg.value == ethTransferred, "Incorrect ETH amount sent");

        emit BatchExecuted(
            msg.sender,
            transfers.length,
            ethTransferred,
            tokenTransfers
        );
    }
}