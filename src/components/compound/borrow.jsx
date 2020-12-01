import React, { useContext } from 'react';
import { Table, CustomInput, Form, FormGroup, Label } from 'reactstrap';
import { EthContext } from '../../contexts/ethContext';

const Borrow = (props) => {
  const { ethLibrary } = useContext(EthContext);

  return (
    <>
      <h2 className="mb-5">Borrow</h2>

      <Table borderless>
        <thead>
          <tr>
            <th>Asset</th>
            <th>APY</th>
            <th>Wallet</th>
            <th>Collateral</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Ether</th>
            <td>0.1%</td>
            <td>0</td>
            <td>
              <div>
                <CustomInput type="switch" id="exampleCustomSwitch" name="customSwitch" />
              </div>
            </td>
          </tr>
        </tbody>
        <tbody>
          <tr>
            <th>Dai</th>
            <td>0.1%</td>
            <td>0</td>
            <td>
              <div>
                <CustomInput type="switch" id="exampleCustomSwitch" name="customSwitch" />
              </div>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
};

export default Borrow;
