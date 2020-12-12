import { InjectedConnector } from '@web3-react/injected-connector';

export const MetaMask = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] });

const connectors = { MetaMask };

export default connectors;
