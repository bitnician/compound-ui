# Cloning the compound repo

First, you need to clone the compound repository.

If you are using macOS, you may face an issue related to the shasum package. so, I suggest you use my forked repo of compound:
https://github.com/bitnician/compound-protocol

otherwise, go ahead and use the main repo of compound protocol:
https://github.com/compound-finance/compound-protocol

# Setting up an Ethereum Development Environment

### Installing the Solidity Compiler (solc)

you need to install the solidity@5. more information:
https://docs.soliditylang.org/en/v0.7.5/installing-solidity.html

### Installing dependencies

navigate into the repository and install dependencies:

```
   cd compound-protocol/
   yarn install
```

### Adding a local network configuration in saddle.config.js (it's something like truffle-config.js)

Open saddle.config.js in the project root folder. We’ll duplicate the development object within the networks object. The duplicate should be named something like local_fork.
In the providers array of local_fork, we’ll remove the second object that begins with ganache. Instead, we’ll replace the entire second object with a localhost JSON RPC URL. The local_fork’s providers array should now look like the following:

```
providers: [
  {env: "PROVIDER"},
  {http: "http://127.0.0.1:8545"}
],
```

### Making a new network config file for local_fork

This can be done by copying the Kovan configuration and naming it local_fork.json. From the root directory of the project, run the following command.

```
cp networks/kovan.json networks/local_fork.json
```

We copied Kovan because all of the addresses will be the same in our Ganache CLI network fork.

# Running local blockchain and deploying the contract

### Running the ganache

in the new terminal, run this command:

ganache-cli -f https://kovan.infura.io/v3/$infuraProjectId -m "\$Your-Mnemonic"

### Deploy the Compound

To deploy compound, run the following command:

```
yarn repl -n local_fork

```

# Running Interface

clone this react app, install its dependecies and run `npm start`
