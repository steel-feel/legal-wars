// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ITIP20} from "tempo-std/interfaces/ITIP20.sol";
import {StdTokens} from "tempo-std/StdTokens.sol";

contract LegalWars is AccessControl {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    constructor(address _oracle) {
        _grantRole(ORACLE_ROLE, _oracle);
    }

    struct Game {
        address creator;
        address opponent;
        uint256 stake;
        bool creatorStaked;
        bool opponentStaked;
    }
    mapping(bytes32 => Game) public games;

    event Staked(bytes32 indexed gameId, address indexed player, uint256 amount);
  //  event Resolved(bytes32 indexed gameId, address indexed winner, uint256 amount);

    function createGame(
        bytes32 gameId,
        address opponent,
        uint256 _stake
    ) external {
        require(games[gameId].creator == address(0), "GAME_EXISTS");
        games[gameId] = Game(msg.sender, opponent, _stake, false, false);
    }

    function stake(bytes32 gameId) external {
        //fetch the game id
        Game storage g = games[gameId];
        require(
            msg.sender == g.creator || msg.sender == g.opponent,
            "NOT_A_PLAYER"
        );
        
        if (g.creator == msg.sender) {
            require(!g.creatorStaked, "ALREADY_STAKED");
            g.creatorStaked = true;
        } else {
            require(!g.opponentStaked, "ALREADY_STAKED");
            g.opponentStaked = true;
        }

      bool sucess =  ITIP20(StdTokens.ALPHA_USD_ADDRESS).transferFromWithMemo(
            msg.sender,
            address(this),
            g.stake,
            gameId
        );

        require(sucess, "STAKE_FAILED");
        emit Staked(gameId, msg.sender, g.stake);

    }

    function resolve(
        bytes32 gameId,
        address winner
    ) external onlyRole(ORACLE_ROLE) {
        Game memory game = games[gameId];
        require(game.creatorStaked && game.opponentStaked, "GAME_NOT_READY");
        uint256 payout = game.stake * 2;
        ITIP20(StdTokens.ALPHA_USD_ADDRESS).transfer(winner, payout);
    }
}
