/**
 * NETWORK UTILS
 * @dev COAT
 */

/**NETWORK TYPES**/
export type NetworkType = {
    name: string;
    rpcUrl: string;
    explorerUrl: string;
    chainId: number;
};
export const networksByChainId: Record<number, NetworkType> = {
    1: {
        name: "Ethereum Mainnet",
        rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
        explorerUrl: "https://etherscan.io",
        chainId: 1,
    },
    56: {
        name: "Binance Smart Chain Mainnet",
        rpcUrl: "https://bsc-dataseed.binance.org/",
        explorerUrl: "https://bscscan.com",
        chainId: 56,
    },
    137: {
        name: "Polygon Mainnet",
        rpcUrl: "https://polygon-rpc.com",
        explorerUrl: "https://polygonscan.com",
        chainId: 137,
    },
    8453: {
        name: "Base Mainnet",
        rpcUrl: "https://mainnet.base.org",
        explorerUrl: "https://basescan.org",
        chainId: 8453,
    },
};