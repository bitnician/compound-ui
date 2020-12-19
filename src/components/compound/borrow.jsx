import React, { useState, useCallback, useEffect } from 'react';
import { Table, CustomInput } from 'reactstrap';
import ModalForm from './modalForm';
import ABIs from '../../abi/contracts.json';
import { priceFeedAbi } from '../../abi/borrow.json';
import { roundToTwo } from '../../utils/utils';
import _ from 'lodash';
import { useWeb3React } from '@web3-react/core';
const bigNumber = require('big-number');

const Borrow = () => {
  const eth = {
    title: 'eth',
    decimals: 18,
    supplyAPY: 12.4,
    distributionAPY: 0,
    borrowLimit: 7.07,
    borrowLimitUsed: 0,
    underlyingBalance: 0,
    cTokenBalance: 0,
    walletBalance: 0,
    hasCollateral: false,
    cContractAddress: process.env.REACT_APP_CETH_ADDRESS,
    cContractAbi: JSON.parse(ABIs.CEth.abi),
    isErc20: false,
  };

  const dai = {
    title: 'dai',
    decimals: 18,
    supplyAPY: 10.4,
    distributionAPY: 0,
    borrowLimit: 1.07,
    borrowLimitUsed: 0,
    underlyingBalance: 0,
    cTokenBalance: 0,
    walletBalance: 0,
    hasCollateral: false,
    cContractAddress: process.env.REACT_APP_CDAI_ADDRESS,
    cContractAbi: JSON.parse(ABIs.CErc20.abi),
    contractAddress: process.env.REACT_APP_DAI_ADDRESS,
    isErc20: true,
  };

  const web3Context = useWeb3React();
  const [assets, updateAssets] = useState([eth, dai]);
  const [amount, setAmount] = useState(0);
  const [comptroller] = useState({
    address: process.env.REACT_APP_COMPTROLLER_ADDRESS,
    abi: JSON.parse(ABIs.Comptroller.abi),
  });
  const [priceFeed] = useState({
    address: process.env.REACT_APP_PRICEFEED_ADDRESS,
    abi: priceFeedAbi,
  });

  useEffect(() => {
    if (web3Context.active) {
    }
  }, []);

  const handleOnChangeAmount = useCallback(({ currentTarget: input }) => {
    setAmount(input.value);
  }, []);

  const handleOnClickEnable = useCallback(
    async (asset) => {
      const walletAddress = web3Context.account;
      const ethLibrary = web3Context.library.eth;

      const erc20ContractAddress = asset.contractAddress;
      const cErc20ContractAddress = asset.cContractAddress;

      const erc20Contract = new ethLibrary.Contract(asset.cContractAbi, erc20ContractAddress);

      const unlimitedAmount = bigNumber(2).power(256).minus(1);
      await erc20Contract.methods.approve(cErc20ContractAddress, unlimitedAmount).send({
        from: walletAddress,
      });

      const updatedAssets = assets.map((item) => {
        if (item === asset) {
          item.isApproved = true;
          return item;
        }
        return item;
      });
      updateAssets(updatedAssets);
    },
    [web3Context, assets]
  );

  const handleOnClickBorrow = useCallback(
    async (asset) => {
      const walletAddress = web3Context.account;
      const ethLibrary = web3Context.library.eth;

      //* Comptroller contract
      const comptrollerInstance = new ethLibrary.Contract(comptroller.abi, comptroller.address);

      //* Price feed
      const priceFeedInstance = new ethLibrary.Contract(priceFeed.abi, priceFeed.address);

      //* Underlying asset to borrow : Dai
      const daiContract = new ethLibrary.Contract(asset.cContractAbi, asset.contractAddress);

      //*bCDAI Contract
      const cDaiContract = new ethLibrary.Contract(asset.cContractAbi, asset.cContractAddress);

      console.log('Calculating your liquid assets in the protocol...');
      let { 1: liquidity } = await comptrollerInstance.methods.getAccountLiquidity(walletAddress).call();
      liquidity = liquidity / 1e18;

      console.log(liquidity);
    },
    [web3Context, amount, comptroller, priceFeed]
  );

  const handleOnClickRepay = useCallback(
    async (asset) => {
      const walletAddress = web3Context.account;
      const ethLibrary = web3Context.library.eth;

      const contractInstance = new ethLibrary.Contract(asset.cContractAbi, asset.cContractAddress);

      if (asset.isErc20) {
        const withdrawAmount = amount * Math.pow(10, asset.decimals);

        await contractInstance.methods
          .redeemUnderlying(web3Context.library.utils.toBN(withdrawAmount.toString()))
          .send({
            from: walletAddress,
          });
      }
      if (!asset.isErc20) {
        await contractInstance.methods
          .redeemUnderlying(web3Context.library.utils.toWei(amount.toString(), 'ether'))
          .send({
            from: walletAddress,
          });
      }
    },
    [web3Context, amount]
  );

  return (
    <>
      <h2 className="mb-5">Borrow</h2>
      <Table borderless>
        <thead>
          <tr>
            <th>Asset</th>
            <th>APY</th>
            <th>Wallet</th>
            <th>Balance</th>
            <th>Liquidity</th>
            <th>% Of Limit</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr>
              <th>
                <ModalForm
                  type="borrow"
                  assetInfo={asset}
                  onChangeInput={handleOnChangeAmount}
                  onClickBorrow={handleOnClickBorrow}
                  onClickRepay={handleOnClickRepay}
                  onClickEnable={handleOnClickEnable}
                ></ModalForm>
              </th>
              <td>0.1%</td>
              <td>{asset.walletBalance}</td>
              <td>{asset.underlyingBalance}</td>
              <td>2k</td>
              <td>1%</td>
            </tr>
          ))}
        </tbody>
        <tbody></tbody>
      </Table>
    </>
  );
};

export default Borrow;
