import {
    publicClient,
    getOracleWalletClient,
    LEGAL_WARS_ABI,
    CONTRACT_ADDRESS,
} from "../config/contract";
import { onStake } from "./gameService";

/**
 * Call the smart contract resolve() function to release funds to winner
 */
export async function resolveGame(
    gameIdOnchain: string,
    winnerAddress: string
) {
    const walletClient = getOracleWalletClient();

    const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: LEGAL_WARS_ABI,
        functionName: "resolve",
        args: [gameIdOnchain as `0x${string}`, winnerAddress as `0x${string}`],
    });

    console.log(`📝 Resolve TX sent: ${hash}`);

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(
        `✅ Resolve TX confirmed in block ${receipt.blockNumber}`
    );

    return receipt;
}

/**
 * Watch for Staked events on the contract and update game state
 */
export function watchStakingEvents() {
    console.log("👀 Watching for Staked events on contract...");

    const unwatch = publicClient.watchContractEvent({
        address: CONTRACT_ADDRESS,
        abi: LEGAL_WARS_ABI,
        eventName: "Staked",
        onLogs: async (logs) => {
            for (const log of logs) {
                const { gameId, player, amount } = log.args as {
                    gameId: string;
                    player: string;
                    amount: bigint;
                };

                console.log(
                    `💰 Staked event: gameId=${gameId}, player=${player}, amount=${amount}`
                );

                try {
                    await onStake(gameId, player);
                } catch (err) {
                    console.error("Error processing Staked event:", err);
                }
            }
        },
        onError: (error) => {
            console.error("Error watching Staked events:", error);
        },
    });

    return unwatch;
}
