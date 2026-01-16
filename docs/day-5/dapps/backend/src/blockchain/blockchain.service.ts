import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { SIMPLE_STORAGE_ABI } from "./simple-storage.abi";

@Injectable()
export class BlockchainService {
    private client;
    private contractAddress: `0x${string}`;

    constructor(private configService: ConfigService) {
        this.client = createPublicClient({
            chain: avalancheFuji,
            transport: http(this.configService.get<string>('RPC_URL')),
        });

        // Address hasil deploy Day 3
        this.contractAddress = this.configService.get<string>('CONTRACT_ADDRESS') as `0x${string}`;
    }

    // 🔹 Read latest value
    async getLatestValue() {
        const latestBlock = await this.client.getBlock({ blockTag: 'latest' });

        const value = await this.client.readContract({
            address: this.contractAddress,
            abi: SIMPLE_STORAGE_ABI,
            functionName: "getValue",
        });

        return {
            value: Number(value),
            blockNumber: Number(latestBlock.number),
            updatedAt: new Date(Number(latestBlock.timestamp) * 1000).toISOString(),
        };
    }

    // 🔹 Read owner address
    async getOwner() {
        const owner = await this.client.readContract({
            address: this.contractAddress,
            abi: SIMPLE_STORAGE_ABI,
            functionName: "owner",
        });

        return {
            owner,
        };
    }

    // 🔹 Read ValueUpdated events
    async getValueUpdatedEvents() {
        const currentBlock = await this.client.getBlockNumber();
        const fromBlock = currentBlock - 2000n > 0n ? currentBlock - 2000n : 0n;

        const events = await this.client.getLogs({
            address: this.contractAddress,
            event: {
                type: "event",
                name: "ValueUpdated",
                inputs: [
                    {
                        name: "newValue",
                        type: "uint256",
                        indexed: false,
                    },
                ],
            },
            fromBlock: fromBlock,
            toBlock: "latest",
        });

        return events.map((event) => ({
            blockNumber: event.blockNumber?.toString(),
            value: event.args.newValue.toString(),
            txHash: event.transactionHash,
        }));
    }

    // 🔹 Read OwnerSet events
    async getOwnerSetEvents() {
        const currentBlock = await this.client.getBlockNumber();
        const fromBlock = currentBlock - 2000n > 0n ? currentBlock - 2000n : 0n;

        const events = await this.client.getLogs({
            address: this.contractAddress,
            event: {
                type: "event",
                name: "OwnerSet",
                inputs: [
                    {
                        name: "oldOwner",
                        type: "address",
                        indexed: true,
                    },
                    {
                        name: "newOwner",
                        type: "address",
                        indexed: true,
                    },
                ],
            },
            fromBlock: fromBlock,
            toBlock: "latest",
        });

        return events.map((event) => ({
            blockNumber: event.blockNumber?.toString(),
            oldOwner: event.args.oldOwner,
            newOwner: event.args.newOwner,
            txHash: event.transactionHash,
        }));
    }
}
