// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Sagecoin.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        Sagecoin sagecoin = new Sagecoin("Sagecoin", "SGUSD");

        vm.stopBroadcast();

        console.log("Sagecoin deployed to:", address(sagecoin));
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
    }
}
