import React, { Component, createContext } from 'react';
import { useWeb3Context } from 'web3-react';

export const EthContext = createContext();

class EthProvider extends Component {
  state = {
    ethLibrary: {},
  };

  setEthLibrary = (ethLib) => {
    this.setState({ ethLibrary: ethLib });
  };

  render() {
    return (
      <EthContext.Provider value={{ ...this.state, setEthLibrary: this.setEthLibrary }}>
        {this.props.children}
      </EthContext.Provider>
    );
  }
}

export default EthProvider;
