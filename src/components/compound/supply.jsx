import React, { Component } from 'react';
import ModalForm from './modalForm';
import { Table, CustomInput } from 'reactstrap';
import Web3 from 'web3';
import { EthContext } from '../../contexts/ethContext';
import abi from '../../abi/contracts.json';
import { roundToTwo } from '../../utils/utils';

class Supply extends Component {
  static contextType = EthContext;

  state = {
    etherInfo: {
      title: 'Ether',
      supplyAPY: 12.4,
      distributionAPY: 0,
      borrowLimit: 7.07,
      borrowLimitUsed: 0,
      underlyingBalance: 0,
      walletBalance: 0,
      hasCollateral: false,
      cContractAddress: process.env.REACT_APP_CETH_ADDRESS,
      isErc20: false,
    },
    daiInfo: {
      title: 'Dai',
      supplyAPY: 10.4,
      distributionAPY: 0,
      borrowLimit: 1.07,
      borrowLimitUsed: 0,
      underlyingtBalance: 0,
      walletBalance: 0,
      hasCollateral: false,
      cContractAddress: process.env.REACT_APP_CDAI_ADDRESS,
      contractAddress: process.env.REACT_APP_DAI_ADDRESS,
      isErc20: true,
    },
  };

  async componentDidMount() {
    const { daiInfo } = this.state;
    await Promise.all([
      await this.getUnderlyingBalanceOfEth(),
      await this.getUnderlyingBalanceOfDai(),
      await this.getBalanceOfEth(),
      await this.getBalanceOfDai(),
      await this.getAssetsIn(),
      await this.isApproved(daiInfo),
    ]);
  }
  handleOnChangeInput = ({ currentTarget: input }) => {
    this.setState({
      value: input.value,
    });
  };

  handleOnChangeCollateral = async (e, assetInfo) => {
    const web3 = new Web3(Web3.givenProvider);

    const cContractAddress = assetInfo.cContractAddress;

    const comptrollerAddress = process.env.REACT_APP_COMPTROLLER_ADDRESS;
    const { abi: comptrollerAbiJson } = abi.Comptroller;
    const comptrollerContract = new web3.eth.Contract(JSON.parse(comptrollerAbiJson), comptrollerAddress);

    const accounts = await web3.eth.getAccounts();
    const walletAddress = accounts[0];

    if (assetInfo.hasCollateral) {
      await comptrollerContract.methods.exitMarket(cContractAddress).send({
        from: walletAddress,
      });
    }
    if (!assetInfo.hasCollateral) {
      await comptrollerContract.methods.enterMarkets([cContractAddress]).send({
        from: walletAddress,
      });
    }
  };

  handleOnClickSupply = async () => {
    const { value } = this.state;
    const { ethLibrary } = this.context;

    const contractAddress = process.env.REACT_APP_CETH_ADDRESS;
    const { abi: abiJson } = abi.CEth;

    const cEthContract = new ethLibrary.Contract(JSON.parse(abiJson), contractAddress);

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
    const { abi: abiJson } = abi.CEth;
    const cEthContract = new ethLibrary.Contract(abiJson, contractAddress);

    const ethDecimals = 18;
    const accounts = await ethLibrary.getAccounts();
    const walletAddress = accounts[0];

    let cTokenBalance = (await cEthContract.methods.balanceOf(walletAddress).call()) / 1e8;

    await cEthContract.methods.redeem(cTokenBalance * 1e8).send({
      from: walletAddress,
    });
  };

  isApproved = async (assetInfo) => {
    const web3 = new Web3(Web3.givenProvider);

    const daiContractAddress = assetInfo.contractAddress;
    const cDaiContractAddress = assetInfo.cContractAddress;

    const { abi: cErc20AbiJson } = abi.CErc20;

    const daiContract = new web3.eth.Contract(JSON.parse(cErc20AbiJson), daiContractAddress);

    const accounts = await web3.eth.getAccounts();
    const walletAddress = accounts[0];

    const result = await daiContract.methods.allowance(walletAddress, cDaiContractAddress).call({
      from: walletAddress,
    });

    if (result && result > 0) {
      assetInfo.isApproved = true;

      this.setState({
        daiInfo: assetInfo,
      });
    }
  };

  handleOnClickEnable = async (assetInfo) => {
    const web3 = new Web3(Web3.givenProvider);

    const daiContractAddress = assetInfo.contractAddress;
    const cDaiContractAddress = assetInfo.cContractAddress;

    const { abi: cErc20AbiJson } = abi.CErc20;

    const daiContract = new web3.eth.Contract(JSON.parse(cErc20AbiJson), daiContractAddress);

    const accounts = await web3.eth.getAccounts();
    const walletAddress = accounts[0];

    await daiContract.methods.approve(cDaiContractAddress, web3.utils.toBN(2 ^ 256)).send({
      from: walletAddress,
    });

    assetInfo.isApproved = true;

    this.setState({
      daiInfo: assetInfo,
    });
  };

  getBalanceOfEth = async () => {
    const { etherInfo } = this.state;

    const web3 = new Web3(Web3.givenProvider);

    const accounts = await web3.eth.getAccounts();
    const walletAddress = accounts[0];

    const ethBalanceInWei = await web3.eth.getBalance(walletAddress);
    const ethBalnceInEther = web3.utils.fromWei(ethBalanceInWei, 'ether');

    etherInfo.walletBalance = roundToTwo(ethBalnceInEther);

    this.setState({
      etherInfo,
    });
  };
  getBalanceOfDai = async () => {
    const { daiInfo } = this.state;

    const web3 = new Web3(Web3.givenProvider);

    const daiContractAddress = process.env.REACT_APP_DAI_ADDRESS;

    const { abi: cErc20AbiJson } = abi.CErc20;

    const daiContract = new web3.eth.Contract(JSON.parse(cErc20AbiJson), daiContractAddress);

    const accounts = await web3.eth.getAccounts();
    const walletAddress = accounts[0];

    const balanceOfDai = (await daiContract.methods.balanceOf(walletAddress).call()) / 1e18;

    daiInfo.walletBalance = roundToTwo(balanceOfDai);

    this.setState({
      daiInfo,
    });
  };

  getUnderlyingBalanceOfEth = async () => {
    const { etherInfo } = this.state;

    const web3 = new Web3(Web3.givenProvider);

    const cEthContractAddress = process.env.REACT_APP_CETH_ADDRESS;

    const { abi: cEthAbiJson } = abi.CEth;

    const cEthContract = new web3.eth.Contract(JSON.parse(cEthAbiJson), cEthContractAddress);

    const ethDecimals = 18;

    const accounts = await web3.eth.getAccounts();
    const walletAddress = accounts[0];
    console.log(accounts);

    const balanceOfEth =
      Web3.utils.toBN(await cEthContract.methods.balanceOfUnderlying(walletAddress).call()) / Math.pow(10, ethDecimals);

    let cTokenBalanceForEth = (await cEthContract.methods.balanceOf(walletAddress).call()) / 1e8;

    etherInfo.underlyingBalance = roundToTwo(balanceOfEth);

    this.setState({
      etherInfo,
    });
  };
  getUnderlyingBalanceOfDai = async () => {
    const { daiInfo } = this.state;

    const web3 = new Web3(Web3.givenProvider);

    const cDaiContractAddress = process.env.REACT_APP_CDAI_ADDRESS;

    const { abi: cErc20AbiJson } = abi.CErc20;

    const cDaiContract = new web3.eth.Contract(JSON.parse(cErc20AbiJson), cDaiContractAddress);

    const ethDecimals = 18;

    const accounts = await web3.eth.getAccounts();
    const walletAddress = accounts[0];
    console.log(accounts);

    const balanceOfDai =
      Web3.utils.toBN(await cDaiContract.methods.balanceOfUnderlying(walletAddress).call()) / Math.pow(10, ethDecimals);

    let cTokenBalanceForDai = (await cDaiContract.methods.balanceOf(walletAddress).call()) / 1e8;

    daiInfo.underlyingtBalance = roundToTwo(balanceOfDai);

    this.setState({
      daiInfo,
    });
  };

  getAssetsIn = async () => {
    const { etherInfo, daiInfo } = this.state;
    const web3 = new Web3(Web3.givenProvider);

    const comptrollerAddress = process.env.REACT_APP_COMPTROLLER_ADDRESS;
    const { abi: comptrollerAbiJson } = abi.Comptroller;

    const comptrollerContract = new web3.eth.Contract(JSON.parse(comptrollerAbiJson), comptrollerAddress);

    const accounts = await web3.eth.getAccounts();
    const walletAddress = accounts[0];

    const results = await comptrollerContract.methods.getAssetsIn(walletAddress).call();
    if (results.includes(process.env.REACT_APP_CETH_ADDRESS)) {
      etherInfo.hasCollateral = true;
      this.setState({
        etherInfo,
      });
    }
    if (results.includes(process.env.REACT_APP_CDAI_ADDRESS)) {
      daiInfo.hasCollateral = true;
      this.setState({
        daiInfo,
      });
    }
  };

  render() {
    const { etherInfo, daiInfo } = this.state;

    return (
      <>
        <h2 className="mb-5">Supply</h2>
        <Table borderless>
          <thead>
            <tr>
              <th>Asset</th>
              <th>APY</th>
              <th>Wallet</th>
              <th>Underlying</th>
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
              <td>{etherInfo.walletBalance}</td>
              <td>{etherInfo.underlyingBalance}</td>
              <td>
                <div>
                  {etherInfo.underlyingBalance ? (
                    <CustomInput
                      onChange={async (e) => await this.handleOnChangeCollateral(e, etherInfo)}
                      type="switch"
                      checked={etherInfo.hasCollateral}
                      id="swithEthCollateral"
                      name="customSwitch"
                    />
                  ) : null}
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
                  onClickEnable={this.handleOnClickEnable}
                ></ModalForm>
              </th>
              <td>0.1%</td>
              <td>{daiInfo.walletBalance}</td>
              <td>{daiInfo.underlyingtBalance}</td>
              <td>
                <div>
                  {daiInfo.underlyingtBalance ? (
                    <CustomInput
                      onChange={this.handleOnChangeCollateral}
                      type="switch"
                      checked={daiInfo.hasCollateral}
                      id="swithDaiCollateral"
                      name="customSwitch"
                    />
                  ) : null}
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
