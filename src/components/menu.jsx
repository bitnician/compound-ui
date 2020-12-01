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
  const context = useWeb3Context();
  console.log(context);

  return (
    <div>
      <Navbar color="light" light expand="md">
        <NavbarBrand>
          <NetworkIndicator
            currentNetwork={context.networkId}
            requiredNetwork={+process.env.REACT_APP_REQUIRED_NETWORK}
          />
        </NavbarBrand>
      </Navbar>
    </div>
  );
};

export default Menu;
