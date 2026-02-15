"use client";

import { useState, useCallback } from "react";
import { useWallets } from "@privy-io/react-auth";
import {
    createPublicClient,
    createWalletClient,
    custom,
    http,
    defineChain,
} from "viem";
import {
    ALPHA_USD_ADDRESS,
    LEGAL_WARS_ADDRESS,
    LEGAL_WARS_ABI,
    ERC20_ABI,
} from "@/lib/contract";

const tempo = defineChain({
    id: 42431,
    name: "Tempo Moderato",
    nativeCurrency: { name: "AlphaUSD", symbol: "aUSD", decimals: 6 },
    rpcUrls: {
        default: { http: ["https://rpc.moderato.tempo.xyz"] },
    },
});

export function useStake() {
    const { wallets } = useWallets();
    const [isStaking, setIsStaking] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");

    const publicClient = createPublicClient({
        chain: tempo,
        transport: http(),
    });

    /**
     * Create a game on-chain and then stake.
     * Called by the game creator after they create a game via API.
     */
    const createAndStake = useCallback(
        async (
            gameIdOnchain: string,
            opponentAddress: string,
            stakeAmount: string
        ) => {
            if (!embeddedWallet) throw new Error("No embedded wallet found");
            setIsStaking(true);
            setError(null);
            setTxHash(null);

            try {
                const provider = await embeddedWallet.getEthereumProvider();
                const walletClient = createWalletClient({
                    account: embeddedWallet.address as `0x${string}`,
                    chain: tempo,
                    transport: custom(provider),
                });

                // 1. Approve ERC20 spend
                const approveHash = await walletClient.writeContract({
                    address: ALPHA_USD_ADDRESS,
                    abi: ERC20_ABI,
                    functionName: "approve",
                    args: [LEGAL_WARS_ADDRESS, BigInt(stakeAmount)],
                });
                await publicClient.waitForTransactionReceipt({ hash: approveHash });

                // 2. Create game on-chain
                const createHash = await walletClient.writeContract({
                    address: LEGAL_WARS_ADDRESS,
                    abi: LEGAL_WARS_ABI,
                    functionName: "createGame",
                    args: [
                        gameIdOnchain as `0x${string}`,
                        opponentAddress as `0x${string}`,
                        BigInt(stakeAmount),
                    ],
                });
                await publicClient.waitForTransactionReceipt({ hash: createHash });

                // 3. Stake
                const stakeHash = await walletClient.writeContract({
                    address: LEGAL_WARS_ADDRESS,
                    abi: LEGAL_WARS_ABI,
                    functionName: "stake",
                    args: [gameIdOnchain as `0x${string}`],
                });
                await publicClient.waitForTransactionReceipt({ hash: stakeHash });

                setTxHash(stakeHash);
                return stakeHash;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Staking failed";
                setError(message);
                throw err;
            } finally {
                setIsStaking(false);
            }
        },
        [embeddedWallet, publicClient]
    );

    /**
     * Stake on an existing game (opponent staking).
     */
    const stakeOnGame = useCallback(
        async (gameIdOnchain: string, stakeAmount: string) => {
            if (!embeddedWallet) throw new Error("No embedded wallet found");
            setIsStaking(true);
            setError(null);
            setTxHash(null);

            try {
                const provider = await embeddedWallet.getEthereumProvider();
                const walletClient = createWalletClient({
                    account: embeddedWallet.address as `0x${string}`,
                    chain: tempo,
                    transport: custom(provider),
                });

                // 1. Approve ERC20 spend
                const approveHash = await walletClient.writeContract({
                    address: ALPHA_USD_ADDRESS,
                    abi: ERC20_ABI,
                    functionName: "approve",
                    args: [LEGAL_WARS_ADDRESS, BigInt(stakeAmount)],
                });
                await publicClient.waitForTransactionReceipt({ hash: approveHash });

                // 2. Stake
                const stakeHash = await walletClient.writeContract({
                    address: LEGAL_WARS_ADDRESS,
                    abi: LEGAL_WARS_ABI,
                    functionName: "stake",
                    args: [gameIdOnchain as `0x${string}`],
                });
                await publicClient.waitForTransactionReceipt({ hash: stakeHash });

                setTxHash(stakeHash);
                return stakeHash;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Staking failed";
                setError(message);
                throw err;
            } finally {
                setIsStaking(false);
            }
        },
        [embeddedWallet, publicClient]
    );

    return {
        createAndStake,
        stakeOnGame,
        isStaking,
        txHash,
        error,
    };
}
