import { parseAbi } from "viem";

export const ALPHA_USD_ADDRESS =
    "0x20C0000000000000000000000000000000000001" as `0x${string}`;

export const LEGAL_WARS_ADDRESS =
    (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
        "0x244e31b48f7d2c18bf91db20b686086165a29218") as `0x${string}`;

export const LEGAL_WARS_ABI = parseAbi([
    "function createGame(bytes32 gameId, address opponent, uint256 _stake) external",
    "function stake(bytes32 gameId) external",
    "function resolve(bytes32 gameId, address winner) external",
    "function games(bytes32 gameId) external view returns (address creator, address opponent, uint256 stake, bool creatorStaked, bool opponentStaked)",
    "event Staked(bytes32 indexed gameId, address indexed player, uint256 amount)",
]);

export const ERC20_ABI = parseAbi([
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
]);
