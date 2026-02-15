// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {ITIP20} from "tempo-std/interfaces/ITIP20.sol";
import {ITIP20RolesAuth} from "tempo-std/interfaces/ITIP20RolesAuth.sol";
import {StdPrecompiles} from "tempo-std/StdPrecompiles.sol";
import {StdTokens} from "tempo-std/StdTokens.sol";
import {LegalWars} from "../src/LegalWars.sol";

contract LegalWarsScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        address feeToken = vm.envOr("TEMPO_FEE_TOKEN", StdTokens.ALPHA_USD_ADDRESS);
        StdPrecompiles.TIP_FEE_MANAGER.setUserToken(feeToken);

        address oracle = vm.envOr("TEMPO_ORACLE",msg.sender );
        new LegalWars(oracle);

        vm.stopBroadcast();
    }
}
