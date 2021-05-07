import React, { useState, useCallback, useEffect, useContext } from 'react';
import { Table, CustomInput } from 'reactstrap';
import ModalForm from './modalForm';
import ABIs from '../../abi/contracts.json';
import _ from 'lodash';
import { useWeb3React } from '@web3-react/core';
import { CompoundLensContext } from '../../contexts/compoundLensContexts';
import Loader from '../loader';
import BN from 'bn.js';
const bigNumber = require('big-number');

const Supply = () => {
  const web3Context = useWeb3React();
  const lensContext = useContext(CompoundLensContext);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0);
  const [comptroller] = useState({
    address: process.env.REACT_APP_COMPTROLLER_ADDRESS,
    abi: JSON.parse(ABIs.Comptroller.abi),
  });
  const [erc20ABI] = useState(JSON.parse(ABIs.CErc20.abi));
  const [cEthABI] = useState(JSON.parse(ABIs.CEth.abi));

  const [lensValues, setLensValue] = useState({
    assetInfo: [],
    accountInfo: {},
    cf: {},
  });
  const [assetsList, setAssetsList] = useState({
    allAssets: [],
    suppliedAssets: [],
  });

  const test = useCallback(async () => {
    const walletAddress = web3Context.account;
    const ethLibrary = web3Context.library.eth;
    const comptrollerContract = new ethLibrary.Contract(
      comptroller.abi,
      comptroller.address
    );
    const result = await comptrollerContract.methods
      .getAssetsIn(walletAddress)
      .call();
    console.log(result);
  }, [comptroller, web3Context]);

  const getAssetsList = useCallback(() => {
    let allAssets = [];
    let suppliedAssets = [];
    lensValues.assetInfo.forEach((asset) => {
      const item = Object.values(asset)[0];

      if (item.balanceOf > 0 && +item.borrowBalanceCurrentReal <= 0)
        return suppliedAssets.push(item);
      if (item.balanceOf <= 0 && +item.borrowBalanceCurrentReal <= 0)
        return allAssets.push(item);
    });
    setAssetsList({ allAssets, suppliedAssets });
  }, [lensValues]);

  useEffect(() => {
    if (web3Context.active && !_.isEmpty(lensContext.compoundLensValues)) {
      setLensValue(lensContext.compoundLensValues);
      getAssetsList();
      setLoading(false);
    }
  }, [web3Context, lensContext, lensValues, comptroller, getAssetsList]);

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

      // const unlimitedAmount = bigNumber(2).power(256).minus(1);
      const unlimitedAmount = new BN('2').pow(new BN('256')).sub(new BN('1'));
      await erc20Contract.methods
        .approve(cErc20ContractAddress, unlimitedAmount)
        .send({
          from: walletAddress,
        });
      await lensContext.updatecompoundLensValues();
    },
    [web3Context, lensContext, erc20ABI]
  );

  const handleOnChangeCollateral = useCallback(
    async (asset) => {
      const walletAddress = web3Context.account;
      const ethLibrary = web3Context.library.eth;

      const cContractAddress = asset.cTokenAddress;

      const comptrollerContract = new ethLibrary.Contract(
        comptroller.abi,
        comptroller.address
      );

      if (asset.hasCollateral) {
        await comptrollerContract.methods.exitMarket(cContractAddress).send({
          from: walletAddress,
        });
      }

      if (!asset.hasCollateral) {
        await comptrollerContract.methods
          .enterMarkets([cContractAddress])
          .send({
            from: walletAddress,
          });
      }
      await lensContext.updatecompoundLensValues();
    },
    [web3Context, comptroller, lensContext]
  );

  const handleOnClickSupply = useCallback(
    async (asset) => {
      const walletAddress = web3Context.account;
      const ethLibrary = web3Context.library.eth;

      if (asset.isERC20) {
        const contractInstance = new ethLibrary.Contract(
          erc20ABI,
          asset.cTokenAddress
        );
        const supplyAmount = amount * Math.pow(10, +asset.underlyingDecimals);

        await contractInstance.methods
          .mint(web3Context.library.utils.toBN(supplyAmount.toString()))
          .send({
            from: walletAddress,
          });
      }
      if (!asset.isERC20) {
        const contractInstance = new ethLibrary.Contract(
          cEthABI,
          asset.cTokenAddress
        );
        await contractInstance.methods.mint().send({
          from: walletAddress,
          value: web3Context.library.utils.toHex(
            web3Context.library.utils.toWei(amount.toString(), 'ether')
          ),
        });
      }
      await lensContext.updatecompoundLensValues();
    },
    [web3Context, amount, erc20ABI, cEthABI, lensContext]
  );

  const handleOnClickWithdraw = useCallback(
    async (asset) => {
      const walletAddress = web3Context.account;
      const ethLibrary = web3Context.library.eth;

      if (asset.isERC20) {
        const contractInstance = new ethLibrary.Contract(
          erc20ABI,
          asset.cTokenAddress
        );
        const withdrawAmount = amount * Math.pow(10, +asset.underlyingDecimals);

        await contractInstance.methods
          .redeemUnderlying(
            web3Context.library.utils.toBN(withdrawAmount.toString())
          )
          .send({
            from: walletAddress,
          });
      }
      if (!asset.isERC20) {
        const contractInstance = new ethLibrary.Contract(
          cEthABI,
          asset.cTokenAddress
        );
        await contractInstance.methods
          .redeemUnderlying(
            web3Context.library.utils.toWei(amount.toString(), 'ether')
          )
          .send({
            from: walletAddress,
          });
      }
      await lensContext.updatecompoundLensValues();
    },
    [web3Context, amount, cEthABI, erc20ABI, lensContext]
  );

  return (
    <>
      {assetsList.suppliedAssets.length ? (
        <div>
          <h2 className="mb-5">Supply</h2>
          <Table borderless className="asset-wrapper">
            <thead>
              <tr>
                <th>Asset</th>
                <th>APY</th>
                <th>Balance</th>
                <th>Collateral</th>
              </tr>
            </thead>
            <tbody>
              {assetsList.suppliedAssets.map((asset, index) => {
                const item = asset;

                return (
                  <tr className="asset-box" key={index}>
                    <th>
                      <ModalForm
                        type="supply"
                        assetInfo={item}
                        onChangeInput={handleOnChangeAmount}
                        onClickSupply={handleOnClickSupply}
                        onClickWithdraw={handleOnClickWithdraw}
                        onClickEnable={handleOnClickEnable}
                      ></ModalForm>
                    </th>
                    <td>{item.supplyAPY}%</td>

                    <td>
                      {item.balanceOfUnderlying} {item.name}
                    </td>
                    <td>
                      <CustomInput
                        id={`exampleCustomSwitch${index}`}
                        onChange={async (e) =>
                          await handleOnChangeCollateral(item)
                        }
                        type="switch"
                        checked={item.hasCollateral}
                        name="customSwitch"
                        // disabled={item.balanceOfUnderlying > 0 ? false : true}
                      />
                    </td>
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

            <th>Collateral</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <Loader></Loader>
          ) : (
            assetsList.allAssets.map((asset, index) => {
              const item = asset;

              return (
                <tr className="asset-box" key={index}>
                  <th>
                    <ModalForm
                      type="supply"
                      assetInfo={item}
                      onChangeInput={handleOnChangeAmount}
                      onClickSupply={handleOnClickSupply}
                      onClickWithdraw={handleOnClickWithdraw}
                      onClickEnable={handleOnClickEnable}
                    ></ModalForm>
                  </th>
                  <td>{item.supplyAPY}%</td>
                  <td>{item.tokenBalance}</td>
                  <td>
                    <CustomInput
                      id={`exampleCustomSwitch${index}`}
                      onChange={async (e) =>
                        await handleOnChangeCollateral(item)
                      }
                      type="switch"
                      checked={item.hasCollateral}
                      name="customSwitch"
                      // disabled={item.balanceOfUnderlying > 0 ? false : true}
                    />
                  </td>
                </tr>
              );
            })
            // lensValues.assetInfo.map((asset, index) => {
            //   const item = Object.values(asset)[0];

            //   if (item.balanceOf > 0) return null;

            //   return (
            //     <tr className="asset-box" key={index}>
            //       <th>
            //         <ModalForm
            //           type="supply"
            //           assetInfo={item}
            //           onChangeInput={handleOnChangeAmount}
            //           onClickSupply={handleOnClickSupply}
            //           onClickWithdraw={handleOnClickWithdraw}
            //           onClickEnable={handleOnClickEnable}
            //         ></ModalForm>
            //       </th>
            //       <td>{item.supplyAPY}%</td>
            //       <td>{item.tokenBalance}</td>
            //       <td>{item.balanceOfUnderlying}</td>
            //       <td>
            //         <CustomInput
            //           id={`exampleCustomSwitch${index}`}
            //           onChange={async (e) =>
            //             await handleOnChangeCollateral(item)
            //           }
            //           type="switch"
            //           checked={item.hasCollateral}
            //           name="customSwitch"
            //           // disabled={item.balanceOfUnderlying > 0 ? false : true}
            //         />
            //       </td>
            //     </tr>
            //   );
            // })
          )}
        </tbody>
      </Table>
    </>
  );
};

export default Supply;
