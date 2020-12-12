import React, { useState, useEffect } from 'react';
import { Navbar, NavbarBrand, NavbarText, Button } from 'reactstrap';

//* Web3
import { useWeb3React } from '@web3-react/core';
import { useEagerConnect, useInactiveListener } from '../network/hooks';
import { MetaMask } from '../network/connectors';

//* Ribmle UI
import NetworkIndicator from '@rimble/network-indicator';

const Menu = (props) => {
  const web3Context = useWeb3React();
  const [activatingConnector, setActivatingConnector] = useState();

  const { connector, activate, deactivate, active, error, library, chainId, account } = web3Context;

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  const triedEager = useEagerConnect();
  useInactiveListener(!triedEager || !!activatingConnector);

  return (
    <div>
      <Navbar color="light" light expand="md">
        <NavbarBrand style={{ borderRight: '1px solid rgba(0,0,0,.5)', paddingRight: 15 }}>
          <NetworkIndicator
            currentNetwork={web3Context.chainId}
            requiredNetwork={+process.env.REACT_APP_REQUIRED_NETWORK}
          />
        </NavbarBrand>
        {web3Context.active ? (
          <>
            <NavbarText>Current Account: {web3Context.account}</NavbarText>
          </>
        ) : null}
        {!web3Context.active ? (
          <Button
            onClick={() => {
              activate(MetaMask);
            }}
            size="medium"
          >
            Connect with MetaMask
          </Button>
        ) : null}
      </Navbar>
    </div>
  );
};

export default Menu;
