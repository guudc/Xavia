/**
 * ALL CHAIN TOOLS
 * @description This file contains all the chain tools for the application.
 * @dev COAT
 */
import { JsonRpcProvider } from 'ethers';
import { formatEther } from 'ethers';
import { networksByChainId } from '../utils/network';

/**This tool returns the 
 * current block and the tx of a network
 * @dev COAT
 * @param network - The network id to fetch the block and tx from.
 * @returns - The block and tx data.
 */
export const getBlockAndTx = async (network:number) => {   
    try {
        const rpcUrl = networksByChainId[network].rpcUrl;
        if (!rpcUrl) throw new Error('Unsupported network');
           // Fetch block with all transactions
           const provider = new JsonRpcProvider(rpcUrl);
           const blockNumber = await provider.getBlockNumber();
           const block:any = await provider.getBlock(blockNumber, false); // get hashes only
           //block info
           const blockInfo = {
             number: block.number,
             hash: block.hash,
             parentHash: block.parentHash,
             miner: block.miner,
             difficulty: block.difficulty.toString(),
             gasLimit: block.gasLimit.toString(),
             gasUsed: block.gasUsed.toString(),
             timestamp: block.timestamp,
             baseFeePerGas: block.baseFeePerGas?.toString(),
           };
           const txHashes = block.transactions as string[];
           const txChunks = chunkArray(txHashes, 9);
           let transactions: any[] = [];
           for (const chunk of txChunks) {
             const txsInChunk = await Promise.all(
               chunk.map(async (txHash) => {
                 try {
                   const tx = await provider.getTransaction(txHash);
                   const receipt = await provider.getTransactionReceipt(txHash);
                   //check for null values
                   if (!tx || !receipt) return null;
                   return {
                     ...tx,
                     receipt: {
                       status: receipt.status,
                       gasUsed: receipt.gasUsed.toString(),
                       cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
                       contractAddress: receipt.contractAddress,
                       logs: receipt.logs.map((log: any) => ({
                         address: log.address,
                         topics: log.topics,
                         data: log.data,
                         blockNumber: log.blockNumber,
                         transactionHash: log.transactionHash,
                         logIndex: log.logIndex,
                       })),
                     },
                   };
                 } catch (err) {
                   console.error(`Failed to fetch tx or receipt for ${txHash}`, err);
                   return null;
                 }
               })
             );
             transactions.push(...txsInChunk.filter(Boolean));
           }
           //return the block and tx data
           return {
             block: blockInfo,
             transactions,
           };
  } catch (err) {
    console.error("Error fetching block and transaction data:", err);
    throw err;
  }

  function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }
}
