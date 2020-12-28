import React, { useState, useCallback, useEffect, useContext } from 'react';
import { Table, CustomInput } from 'reactstrap';
import ModalForm from './modalForm';
import ABIs from '../../abi/contracts.json';
import { priceFeedAbi } from '../../abi/borrow.json';
import { roundToTwo } from '../../utils/utils';
import _ from 'lodash';
import { useWeb3React } from '@web3-react/core';
import { CompoundLensContext } from '../../contexts/compoundLensContexts';
import Loader from '../loader';
const bigNumber = require('big-number');

const Borrow = () => {
  const web3Context = useWeb3React();
  const lensContext = useContext(CompoundLensContext);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0);
  const [lensValues, setLensValue] = useState({
    assetInfo: [],
    accountInfo: {},
    cf: {},
  });
  const [comptroller] = useState({
    address: process.env.REACT_APP_COMPTROLLER_ADDRESS,
    abi: JSON.parse(ABIs.Comptroller.abi),
  });
  const [erc20ABI] = useState(JSON.parse(ABIs.CErc20.abi));
  const [cEthABI] = useState(JSON.parse(ABIs.CEth.abi));
  const [priceFeed] = useState({
    address: process.env.REACT_APP_PRICEFEED_ADDRESS,
    abi: priceFeedAbi,
  });
  const [assetsList, setAssetsList] = useState({
    allAssets: [],
    borrowedAssets: [],
  });

  const getAssetsList = useCallback(() => {
    let allAssets = [];
    let borrowedAssets = [];
    lensValues.assetInfo.forEach((asset) => {
      const item = Object.values(asset)[0];

      if (item.balanceOf <= 0 && +item.borrowBalanceCurrentReal > 0)
        return borrowedAssets.push(item);
      if (item.balanceOf <= 0 && +item.borrowBalanceCurrentReal <= 0)
        return allAssets.push(item);
    });
    setAssetsList({ allAssets, borrowedAssets });
  }, [lensValues]);

  useEffect(() => {
    if (web3Context.active && !_.isEmpty(lensContext.compoundLensValues)) {
      console.log(lensContext.compoundLensValues);

      setLensValue(lensContext.compoundLensValues);
      getAssetsList();
      setLoading(false);
    }
  }, [web3Context, lensContext, lensValues, getAssetsList]);

  const handleOnChangeAmount = useCallback(({ currentTarget: input }) => {
    setAmount(input.value);
  }, []);

  const handleOnClickEnable = useCallback(
    async (asset) => {
      const walletAddress = web3Context.account;
      const ethLibrary = web3Context.library.eth;

      const erc20ContractAddress = asset.underlyingAssetAddress;
      const cErc20ContractAddress = asset.cTokenAddress;

      const erc20Contract = new ethLibrary.Contract(
        erc20ABI,
        erc20ContractAddress
      );

      const unlimitedAmount = bigNumber(2).power(256).minus(1);
      await erc20Contract.methods
        .approve(cErc20ContractAddress, unlimitedAmount)
        .send({
          from: walletAddress,
        });
      await lensContext.updatecompoundLensValues();
    },
    [web3Context, erc20ABI, lensContext]
  );

  const handleOnClickBorrow = useCallback(
    async (asset) => {
      const walletAddress = web3Context.account;
      const ethLibrary = web3Context.library.eth;

      //* Comptroller contract
      const comptrollerInstance = new ethLibrary.Contract(
        comptroller.abi,
        comptroller.address
      );

      const priceFeedInstance = new ethLibrary.Contract(
        priceFeed.abi,
        priceFeed.address
      );

      const cTokenContract = new ethLibrary.Contract(
        erc20ABI,
        asset.cTokenAddress
      );

      let borrowRate = await cTokenContract.methods.borrowRatePerBlock().call();
      borrowRate = borrowRate / Math.pow(10, 18);

      console.log(borrowRate);

      const scaledUpBorrowAmount = (
        amount * Math.pow(10, +asset.underlyingDecimals)
      ).toString();

      const trx = await cTokenContract.methods
        .borrow(scaledUpBorrowAmount)
        .send({ from: walletAddress });

      await lensContext.updatecompoundLensValues();
    },
    [web3Context, amount, comptroller, priceFeed, lensContext, erc20ABI]
  );

  const handleOnClickRepay = useCallback(
    async (asset) => {
      const walletAddress = web3Context.account;
      const ethLibrary = web3Context.library.eth;
      let cContract;

      if (asset.isERC20) {
        cContract = new ethLibrary.Contract(erc20ABI, asset.cTokenAddress);
        const underlyingToRepay = (
          amount * Math.pow(10, +asset.underlyingDecimals)
        ).toString();
        await cContract.methods
          .repayBorrow(underlyingToRepay)
          .send({ from: walletAddress });
      }
      if (!asset.isERC20) {
        cContract = new ethLibrary.Contract(cEthABI, asset.cTokenAddress);
        await cContract.methods.repayBorrow().send({ from: walletAddress });
      }

      await lensContext.updatecompoundLensValues();
    },
    [web3Context, amount, cEthABI, erc20ABI, lensContext]
  );

  return (
    <>
      {assetsList.borrowedAssets.length ? (
        <div>
          <h2 className="mb-5">Borrowing</h2>
          <Table borderless className="asset-wrapper">
            <thead>
              <tr>
                <th>Asset</th>
                <th>APY</th>
                <th>Balance</th>

                {/* <th>Liquidity</th>
            <th>Limit</th> */}
              </tr>
            </thead>
            <tbody>
              {assetsList.borrowedAssets.map((asset, index) => {
                const item = asset;
                return (
                  <tr key={index} className="asset-box">
                    <th>
                      <ModalForm
                        type="borrow"
                        assetInfo={item}
                        onChangeInput={handleOnChangeAmount}
                        onClickBorrow={handleOnClickBorrow}
                        onClickRepay={handleOnClickRepay}
                        onClickEnable={handleOnClickEnable}
                      ></ModalForm>
                    </th>
                    <td>{item.borrowAPY}%</td>
                    <td>
                      {item.tokenBalance} {item.name}
                    </td>

                    {/* <td>2k</td>
                <td>1%</td> */}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      ) : null}
      <h2 className="mb-5">All Assets</h2>
      <Table borderless className="asset-wrapper">
        <thead>
          <tr>
            <th>Asset</th>
            <th>APY</th>
            <th>Wallet</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <Loader></Loader>
          ) : (
            assetsList.allAssets.map((asset, index) => {
              const item = asset;
              return (
                <tr key={index} className="asset-box">
                  <th>
                    <ModalForm
                      type="borrow"
                      assetInfo={item}
                      onChangeInput={handleOnChangeAmount}
                      onClickBorrow={handleOnClickBorrow}
                      onClickRepay={handleOnClickRepay}
                      onClickEnable={handleOnClickEnable}
                    ></ModalForm>
                  </th>
                  <td>{item.borrowAPY}%</td>
                  <td>{item.tokenBalance}</td>

                  {/* <td>2k</td>
                <td>1%</td> */}
                </tr>
              );
            })
          )}
        </tbody>
        <tbody></tbody>
      </Table>
      {/* <Table borderless className="asset-wrapper">
        <thead>
          <tr>
            <th>Asset</th>
            <th>APY</th>
            <th>Wallet</th>
            <th>Balance</th>
     
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <Loader></Loader>
          ) : (
            lensValues.assetInfo.map((asset, index) => {
              const item = Object.values(asset)[0];
              return (
                <tr key={index}>
                  <th>
                    <ModalForm
                      type="borrow"
                      assetInfo={item}
                      onChangeInput={handleOnChangeAmount}
                      onClickBorrow={handleOnClickBorrow}
                      onClickRepay={handleOnClickRepay}
                      onClickEnable={handleOnClickEnable}
                    ></ModalForm>
                  </th>
                  <td>{item.borrowAPY}%</td>
                  <td>{item.tokenBalance}</td>
                  <td>{item.balanceOfUnderlying}</td>
   
                </tr>
              );
            })
          )}
        </tbody>
        <tbody></tbody>
      </Table> */}
    </>
  );
};

export default Borrow;
