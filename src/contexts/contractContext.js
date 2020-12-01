import React, { Component, createContext } from 'react';
import { EthContext } from './ethContext';
import contracts from '../abi/contracts.json';
import _ from 'lodash';

export const ContractContext = createContext();

class ContractProvider extends Component {
  static contextType = EthContext;

  state = {};

  getContract = async (contractName) => {
    const { ethLibrary } = this.context;
    let compoundContractNames = Object.keys(contracts.contracts);
    compoundContractNames = compoundContractNames.map((el) => el.split(':')[1]);

    const lowerCaseContractName = compoundContractNames.toLowerCase();

    let contract = this.state[contractName];
    if (!_.isEmpty(contract)) return contract;

    const compoundContractObject = Object.keys(contracts.contracts).find((el) => el.includes(contractName));

    const abi = contracts.contracts[compoundContractObject].abi;

    contract = await new ethLibrary.Contract(JSON.parse(abi));

    this.setState({
      [lowerCaseContractName]: contract,
    });
  };

  render() {
    return (
      <ContractContext.Provider value={{ ...this.state, setEthLibrary: this.setEthLibrary }}>
        {this.props.children}
      </ContractContext.Provider>
    );
  }
}

export default ContractProvider;
