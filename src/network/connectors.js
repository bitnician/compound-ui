import { Connectors } from 'web3-react';
const { InjectedConnector, NetworkOnlyConnector } = Connectors;

const MetaMask = new InjectedConnector({ supportedNetworks: [1, 3, 4, 5, 42] });

const Infura = new NetworkOnlyConnector({
  providerURL: `${process.env.REACT_APP_INFURA_KOVAN}/${process.env.REACT_APP_INFURA_API_KEY}`,
});

const connectors = { MetaMask, Infura };

export default connectors;
