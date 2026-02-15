## Tempo Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Tempo's fork of Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Deploy

```shell
$ forge script script/Mail.s.sol:MailScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ cast --help
```


## Deployments

```shell
##### tempo-moderato
✅  [Success] Hash: 0x44a388b4f154a99e5f62b7556a017c4ac596f84a0f442c0d3b7e0791a730e9d0
Contract: LegalWars
Contract Address: 0x244e31B48F7d2C18bf91db20b686086165a29218
Block: 5027139
Paid: 0.121304940012130494 PathUSD (6065247 gas * 20.000000002 gwei)
```
