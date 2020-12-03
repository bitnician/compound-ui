import React, { Component, createContext } from 'react';
import { EthContext } from './ethContext';
import contracts from '../abi/contracts.json';
import contractAddresses from '../network/local_fork.json';
import _ from 'lodash';

export const ContractContext = createContext();

class ContractProvider extends Component {
  static contextType = EthContext;

  state = {};

  getContract = async (contractName) => {
    const { ethLibrary } = this.context;
    let compoundContractNames = Object.keys(contracts.contracts);
    compoundContractNames = compoundContractNames.map((el) => el.split(':')[1].toLocaleLowerCase());

    const contractNameLoweCase = contractName.toLocaleLowerCase();

    let contract = this.state[contractNameLoweCase];
    if (!_.isEmpty(contract)) return contract;

    const compoundContractObject = Object.keys(contracts.contracts).find((el) =>
      el.toLocaleLowerCase().includes(contractNameLoweCase)
    );

    const abi = contracts.contracts[compoundContractObject].abi;
    console.log(abi);

    contract = await new ethLibrary.Contract(JSON.parse(abi), 'address');

    this.setState({
      [contractNameLoweCase]: contract,
    });
  };

  getContractAddress = (contractName) => {
    console.log(Object.keys(contractAddresses.Contracts));

    const address = Object.keys(contractAddresses.Contracts).find(
      (el) => el.toLocaleLowerCase() === contractName.toLocaleLowerCase()
    );
    console.log(address);

    return address;
  };

  render() {
    this.getContractAddress('ceth');
    return (
      <ContractContext.Provider value={{ ...this.state, setEthLibrary: this.setEthLibrary }}>
        {this.props.children}
      </ContractContext.Provider>
    );
  }
}

export default ContractProvider;
