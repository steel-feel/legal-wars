// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {LegalWars} from "../src/LegalWars.sol";
import {ITIP20} from "tempo-std/interfaces/ITIP20.sol";
import {StdTokens} from "tempo-std/StdTokens.sol";
import {StdPrecompiles} from "tempo-std/StdPrecompiles.sol";

// Minimal MockTIP20 to simulate Tempo standard token behavior for testing
contract MockTIP20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint8 public constant decimals = 18;
    string public constant name = "Alpha USD";
    string public constant symbol = "aUSD";
    uint256 public totalSupply;

    function mint(address to, uint256 amount) public {
        balanceOf[to] += amount;
        totalSupply += amount;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        return _transfer(msg.sender, to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        uint256 currentAllowance = allowance[from][msg.sender];
        require(currentAllowance >= amount, "Insufficient allowance");
        if (currentAllowance != type(uint256).max) {
            allowance[from][msg.sender] = currentAllowance - amount;
        }
        return _transfer(from, to, amount);
    }

    function transferFromWithMemo(address from, address to, uint256 amount, bytes32) public returns (bool) {
        return transferFrom(from, to, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract LegalWarsTest is Test {
    LegalWars public legalWars;
    MockTIP20 public token;

    address public admin = address(1);
    address public oracle = address(2);
    address public creator = address(3);
    address public opponent = address(4);
    address public randomUser = address(5);

    function setUp() public {
        // 1. Etch the MockTIP20 code at the StdTokens.ALPHA_USD_ADDRESS
        // This simulates the Tempo network environment where this token exists
        MockTIP20 mockImpl = new MockTIP20();
        vm.etch(StdTokens.ALPHA_USD_ADDRESS, address(mockImpl).code);
        
        // 2. Cast the address to our interface/mock for easier interaction in tests
        token = MockTIP20(StdTokens.ALPHA_USD_ADDRESS);

        // 3. Setup Fee Manager (standard Tempo test setup, though maybe not strictly needed if we mock the token entirely)
        // But good practice if other system contracts are involved.
        address feeToken = StdTokens.ALPHA_USD_ADDRESS;
        // StdPrecompiles.TIP_FEE_MANAGER.setUserToken(feeToken); 
        // Note: calling precompile might fail if not in a tempo-fork or if precompile not mocked.
        // For unit testing logic, we might verify if this is needed. 
        // If it fails, I'll comment it out. Mail.t.sol uses it. I'll include it.
        try StdPrecompiles.TIP_FEE_MANAGER.setUserToken(feeToken) {} catch {
            // If running in pure foundry without tempo/precompiles, this might fail.
            // But we assume the environment supports it or we ignore it for this logic test.
        }

        // 4. Deploy LegalWars
        // Note: LegalWars uses StdTokens.ALPHA_USD_ADDRESS internally
        vm.prank(admin);
        legalWars = new LegalWars(oracle);

        // 5. Mint tokens to users (using our Mock interface on the etched address)
        token.mint(creator, 1000 ether);
        token.mint(opponent, 1000 ether);
        token.mint(randomUser, 1000 ether);

        // 6. Approve LegalWars to spend tokens
        vm.prank(creator);
        token.approve(address(legalWars), type(uint256).max);
        vm.prank(opponent);
        token.approve(address(legalWars), type(uint256).max);
    }

    function test_CreateGame() public {
        bytes32 gameId = keccak256("game1");
        uint256 stakeAmount = 100 ether;

        vm.prank(creator);
        legalWars.createGame(gameId, opponent, stakeAmount);

        (address _creator, address _opponent, uint256 _stake, bool _creatorStaked, bool _opponentStaked) = legalWars.games(gameId);

        assertEq(_creator, creator);
        assertEq(_opponent, opponent);
        assertEq(_stake, stakeAmount);
        assertFalse(_creatorStaked);
        assertFalse(_opponentStaked);
    }

    function test_Stake() public {
        bytes32 gameId = keccak256("game1");
        uint256 stakeAmount = 100 ether;

        vm.prank(creator);
        legalWars.createGame(gameId, opponent, stakeAmount);

        // Creator stakes
        vm.prank(creator);
        legalWars.stake(gameId);
        
        (,,, bool creatorStaked,) = legalWars.games(gameId);
        assertTrue(creatorStaked);
        assertEq(token.balanceOf(address(legalWars)), stakeAmount);

        // Opponent stakes
        vm.prank(opponent);
        legalWars.stake(gameId);

        (,,,, bool opponentStaked) = legalWars.games(gameId);
        assertTrue(opponentStaked);
        assertEq(token.balanceOf(address(legalWars)), stakeAmount * 2);
    }

    function test_Resolve() public {
        bytes32 gameId = keccak256("game1");
        uint256 stakeAmount = 100 ether;

        vm.prank(creator);
        legalWars.createGame(gameId, opponent, stakeAmount);

        vm.prank(creator);
        legalWars.stake(gameId); // 100 in contract

        vm.prank(opponent);
        legalWars.stake(gameId); // 200 in contract

        uint256 contractBalanceBefore = token.balanceOf(address(legalWars));
        uint256 winnerBalanceBefore = token.balanceOf(creator);

        // Oracle resolves
        vm.prank(oracle);
        legalWars.resolve(gameId, creator);

        assertEq(token.balanceOf(address(legalWars)), contractBalanceBefore - (stakeAmount * 2));
        assertEq(token.balanceOf(creator), winnerBalanceBefore + (stakeAmount * 2));
    }

    // Edge Cases

    function test_Revert_Stake_InvalidGame() public {
        bytes32 gameId = keccak256("invalid");
        
        vm.prank(creator);
        vm.expectRevert("NOT_A_PLAYER");
        legalWars.stake(gameId);
    }

    function test_Revert_Stake_NotPlayer() public {
        bytes32 gameId = keccak256("game1");
        uint256 stakeAmount = 100 ether;

        vm.prank(creator);
        legalWars.createGame(gameId, opponent, stakeAmount);

        vm.prank(randomUser);
        vm.expectRevert("NOT_A_PLAYER");
        legalWars.stake(gameId);
    }

    function test_Revert_Stake_AlreadyStaked() public {
        bytes32 gameId = keccak256("game1");
        uint256 stakeAmount = 100 ether;

        vm.prank(creator);
        legalWars.createGame(gameId, opponent, stakeAmount);

        vm.prank(creator);
        legalWars.stake(gameId);
        
        // Try to stake again - should revert
        vm.prank(creator);
        vm.expectRevert("ALREADY_STAKED"); 
        legalWars.stake(gameId); 
    }

    function test_Revert_Resolve_NotOracle() public {
        bytes32 gameId = keccak256("game1");
        uint256 stakeAmount = 100 ether;

        vm.prank(creator);
        legalWars.createGame(gameId, opponent, stakeAmount);
        
        vm.prank(creator);
        legalWars.stake(gameId);
        vm.prank(opponent);
        legalWars.stake(gameId);

        vm.prank(randomUser);
        // The error comes from AccessControl
        vm.expectRevert(); 
        legalWars.resolve(gameId, creator);
    }

    function test_Revert_Resolve_GameNotReady() public {
        bytes32 gameId = keccak256("game1");
        uint256 stakeAmount = 100 ether;

        vm.prank(creator);
        legalWars.createGame(gameId, opponent, stakeAmount);
        
        vm.prank(creator);
        legalWars.stake(gameId);
        
        // Opponent hasn't staked yet

        vm.prank(oracle);
        vm.expectRevert("GAME_NOT_READY");
        legalWars.resolve(gameId, creator);
    }

    function test_Refuse_OverwriteGame() public {
        bytes32 gameId = keccak256("game1");
        uint256 stakeAmount = 100 ether;

        vm.prank(creator);
        legalWars.createGame(gameId, opponent, stakeAmount);

        vm.prank(randomUser);
        vm.expectRevert("GAME_EXISTS");
        legalWars.createGame(gameId, randomUser, stakeAmount);
        
        (address _creator,,,,) = legalWars.games(gameId);
        assertEq(_creator, creator); 
    }
}
