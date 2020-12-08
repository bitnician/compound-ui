import logo from './logo.svg';
import Web3Provider from 'web3-react';
import connectors from './network/connectors';
import Web3 from 'web3';
import Home from './components/home';
import Menu from './components/menu';
import 'bootstrap/dist/css/bootstrap.min.css';
import EthProvider from './contexts/ethContext';

import ContractProvider from './contexts/contractContext';

function getLibrary(provider) {
  const library = new Web3Provider(provider);
  return library;
}

function App() {
  return (
    <Web3Provider connectors={connectors} libraryName={'web3.js'} web3Api={Web3} getLibrary={getLibrary}>
      <EthProvider>
        <ContractProvider>
          <div className="App">
            <Menu></Menu>
            <Home></Home>
          </div>
        </ContractProvider>
      </EthProvider>
    </Web3Provider>
  );
}

export default App;
