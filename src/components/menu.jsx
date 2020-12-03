import React, { useState } from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavbarText,
} from 'reactstrap';
import { useWeb3Context } from 'web3-react';
import NetworkIndicator from '@rimble/network-indicator';

const Menu = (props) => {
  const web3context = useWeb3Context();

  return (
    <div>
      <Navbar color="light" light expand="md">
        <NavbarBrand style={{ borderRight: '1px solid rgba(0,0,0,.5)', paddingRight: 15 }}>
          <NetworkIndicator
            currentNetwork={web3context.networkId}
            requiredNetwork={+process.env.REACT_APP_REQUIRED_NETWORK}
          />
        </NavbarBrand>

        <NavbarText>Current Address: {web3context.account}</NavbarText>
      </Navbar>
    </div>
  );
};

export default Menu;
