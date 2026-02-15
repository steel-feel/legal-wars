import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";

// Tempo chain definition
export const tempoChain = defineChain({
    id: 42431,
    name: "Tempo",
    nativeCurrency: {
        decimals: 18,
        name: "TEMPO",
        symbol: "TEMPO",
    },
    rpcUrls: {
        default: {
            http: [process.env.RPC_URL || "https://rpc.tempo.xyz"],
        },
    },
});

// LegalWars contract ABI (minimal)
export const LEGAL_WARS_ABI = parseAbi([
    "function createGame(bytes32 gameId, address opponent, uint256 _stake) external",
    "function stake(bytes32 gameId) external",
    "function resolve(bytes32 gameId, address winner) external",
    "function games(bytes32 gameId) external view returns (address creator, address opponent, uint256 stake, bool creatorStaked, bool opponentStaked)",
    "event Staked(bytes32 indexed gameId, address indexed player, uint256 amount)",
]);

export const CONTRACT_ADDRESS = (process.env.CONTRACT_ADDRESS ||
    "0x244e31b48f7d2c18bf91db20b686086165a29218") as `0x${string}`;

// Public client for reading/events
export const publicClient = createPublicClient({
    chain: tempoChain,
    transport: http(),
});

// Wallet client for oracle transactions (resolve)
export function getOracleWalletClient() {
    const privateKey = process.env.ORACLE_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("ORACLE_PRIVATE_KEY environment variable is not set");
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`);

    return createWalletClient({
        account,
        chain: tempoChain,
        transport: http(),
    });
}
