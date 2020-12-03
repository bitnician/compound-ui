import React, { Component } from 'react';
import ModalForm from './modalForm';
import { Table, CustomInput, Container, Button } from 'reactstrap';
import Web3 from 'web3';
import { EthContext } from '../../contexts/ethContext';
import abi from '../../abi/contracts.json';
import Modal from '../modal';
import Input from '../input';
import Tabs from '../tabs';

class Supply extends Component {
  static contextType = EthContext;

  state = {
    value: 0,
  };

  handleOnChangeInput = ({ currentTarget: input }) => {
    this.setState({
      value: input.value,
    });
  };

  handleOnClickSupply = async () => {
    const { value } = this.state;

    const { ethLibrary } = this.context;

    const contractAddress = process.env.REACT_APP_CETH_ADDRESS;
    const abiJson = abi.cEthAbi;

    const cEthContract = new ethLibrary.Contract(abiJson, contractAddress);

    const ethDecimals = 18;
    const accounts = await ethLibrary.getAccounts();
    const walletAddress = accounts[0];

    await cEthContract.methods.mint().send({
      from: walletAddress,
      value: Web3.utils.toHex(Web3.utils.toWei(value.toString(), 'ether')),
    });
  };

  handleOnClickWithdraw = async () => {
    const { value } = this.state;
    console.log('from withdraw', value);

    const { ethLibrary } = this.context;

    const contractAddress = process.env.REACT_APP_CETH_ADDRESS;
    const abiJson = abi.cEthAbi;
    const cEthContract = new ethLibrary.Contract(abiJson, contractAddress);

    const ethDecimals = 18;
    const accounts = await ethLibrary.getAccounts();
    const walletAddress = accounts[0];

    let cTokenBalance = (await cEthContract.methods.balanceOf(walletAddress).call()) / 1e8;

    await cEthContract.methods.redeem(cTokenBalance * 1e8).send({
      from: walletAddress,
    });
  };

  render() {
    const etherInfo = {
      title: 'Ether',
      supplyAPY: 12.4,
      distributionAPY: 0,
      borrowLimit: 7.07,
      borrowLimitUsed: 0,
      walletBalance: 0.1386,
    };
    const daiInfo = {
      title: 'Dai',
      supplyAPY: 10.4,
      distributionAPY: 0,
      borrowLimit: 1.07,
      borrowLimitUsed: 0,
      walletBalance: 0.1386,
    };
    return (
      <>
        <h2 className="mb-5">Supply</h2>
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
              <th>
                <ModalForm
                  assetInfo={etherInfo}
                  onChangeInput={this.handleOnChangeInput}
                  onClickSupply={this.handleOnClickSupply}
                  onClickWithdraw={this.handleOnClickWithdraw}
                ></ModalForm>
              </th>
              <td>0.1%</td>
              <td>0</td>
              <td>
                <div>
                  <CustomInput type="switch" id="swithEthCollateral" name="customSwitch" />
                </div>
              </td>
            </tr>
          </tbody>
          <tbody>
            <tr>
              <th>
                <ModalForm
                  assetInfo={daiInfo}
                  onChangeInput={this.handleOnChangeInput}
                  onClickSupply={this.handleOnClickSupply}
                  onClickWithdraw={this.handleOnClickWithdraw}
                ></ModalForm>
              </th>
              <td>0.1%</td>
              <td>0</td>
              <td>
                <div>
                  <CustomInput type="switch" id="swithDaiCollateral" name="customSwitch" />
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
      </>
    );
  }
}

export default Supply;
