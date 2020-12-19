import React, { useState, useCallback, useEffect } from 'react';
import { Table, CustomInput } from 'reactstrap';
import ModalForm from './modalForm';
import ABIs from '../../abi/contracts.json';
import { roundToTwo } from '../../utils/utils';
import _ from 'lodash';
import { useWeb3React } from '@web3-react/core';
const bigNumber = require('big-number');

const Supply = () => {
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

  const getAssetsBalance = useCallback(
    async (assets) => {
      const walletAddress = web3Context.account;
      const ethLibrary = web3Context.library.eth;

      const assetsPromise = assets.map(async (item) => {
        if (item.isErc20) {
          const erc20Contract = new ethLibrary.Contract(item.cContractAbi, item.contractAddress);
          const cErc20Contract = new ethLibrary.Contract(item.cContractAbi, item.cContractAddress);

          const balanceOfUnderlyingErc20 =
            (await cErc20Contract.methods.balanceOfUnderlying(walletAddress).call()) / Math.pow(10, item.decimals);

          const balanceOfWelletErc20 =
            (await erc20Contract.methods.balanceOf(walletAddress).call()) / Math.pow(10, item.decimals);

          item.underlyingBalance = roundToTwo(balanceOfUnderlyingErc20);
          item.walletBalance = roundToTwo(balanceOfWelletErc20);

          return item;
        }

        if (!item.isErc20) {
          const balanceInWei = await ethLibrary.getBalance(walletAddress);
          const balnceOfEtherWallet = web3Context.library.utils.fromWei(balanceInWei, 'ether');

          const cEthContract = new ethLibrary.Contract(item.cContractAbi, item.cContractAddress);

          const balanceOfUnderlyingEth =
            web3Context.library.utils.toBN(await cEthContract.methods.balanceOfUnderlying(walletAddress).call()) /
            Math.pow(10, item.decimals);

          item.walletBalance = roundToTwo(balnceOfEtherWallet);
          item.underlyingBalance = roundToTwo(balanceOfUnderlyingEth);

          return item;
        }
      });

      const updatedAssets = await Promise.all(assetsPromise);
      return updatedAssets;
      // updateAssets(updatedAssets);
    },
    [web3Context]
  );

  const isApproved = useCallback(
    async (assets) => {
      const walletAddress = web3Context.account;
      const ethLibrary = web3Context.library.eth;

      const updatedAssetsPromis = assets.map(async (item) => {
        if (item.isErc20) {
          const erc20ContractAddress = item.contractAddress;
          const cErc20ContractAddress = item.cContractAddress;

          const erc20Contract = new ethLibrary.Contract(item.cContractAbi, erc20ContractAddress);

          const result = await erc20Contract.methods.allowance(walletAddress, cErc20ContractAddress).call({
            from: walletAddress,
          });

          if (result && result > 0) {
            item.isApproved = true;
          }
        }

        return item;
      });

      const updatedAssets = await Promise.all(updatedAssetsPromis);
      return updatedAssets;

      // updateAssets(updatedAssets);
    },
    [web3Context]
  );

  const getAssetsIn = useCallback(
    async (assets) => {
      const walletAddress = web3Context.account;
      const ethLibrary = web3Context.library.eth;

      const comptrollerContract = new ethLibrary.Contract(comptroller.abi, comptroller.address);

      const results = await comptrollerContract.methods.getAssetsIn(walletAddress).call();

      const updatedAssets = assets.map((item) => {
        if (results.includes(item.cContractAddress)) {
          item.hasCollateral = true;
        }
        return item;
      });

      return updatedAssets;

      // updateAssets(updatedAssets);
    },
    [web3Context, comptroller]
  );

  const updateAssetState = useCallback(async () => {
    let updatedAssets = await getAssetsBalance(assets);
    updatedAssets = await isApproved(updatedAssets);
    updatedAssets = await getAssetsIn(updatedAssets);
    updateAssets(updatedAssets);
  }, [assets, getAssetsBalance, isApproved, getAssetsIn]);

  useEffect(() => {
    if (web3Context.active) {
      updateAssetState();
    }
  }, [updateAssetState, web3Context]);

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

  const handleOnChangeCollateral = useCallback(
    async (e, asset) => {
      const walletAddress = web3Context.account;
      const ethLibrary = web3Context.library.eth;

      const cContractAddress = asset.cContractAddress;

      const comptrollerContract = new ethLibrary.Contract(comptroller.abi, comptroller.address);

      if (asset.hasCollateral) {
        await comptrollerContract.methods.exitMarket(cContractAddress).send({
          from: walletAddress,
        });
        const updatedAssets = assets.map((item) => {
          if (item === asset) {
            item.hasCollateral = false;
            return item;
          }
          return item;
        });
        updateAssets(updatedAssets);
      }

      if (!asset.hasCollateral) {
        await comptrollerContract.methods.enterMarkets([cContractAddress]).send({
          from: walletAddress,
        });
        const updatedAssets = assets.map((item) => {
          if (item === asset) {
            item.hasCollateral = true;
            return item;
          }
          return item;
        });
        updateAssets(updatedAssets);
      }
    },
    [web3Context, assets, comptroller]
  );

  const handleOnClickSupply = useCallback(
    async (asset) => {
      const walletAddress = web3Context.account;
      const ethLibrary = web3Context.library.eth;

      const contractInstance = new ethLibrary.Contract(asset.cContractAbi, asset.cContractAddress);

      if (asset.isErc20) {
        const supplyAmount = amount * Math.pow(10, asset.decimals);

        await contractInstance.methods.mint(web3Context.library.utils.toBN(supplyAmount.toString())).send({
          from: walletAddress,
        });
      }
      if (!asset.isErc20) {
        await contractInstance.methods.mint().send({
          from: walletAddress,
          value: web3Context.library.utils.toHex(web3Context.library.utils.toWei(amount.toString(), 'ether')),
        });
      }
    },
    [web3Context, amount]
  );

  const handleOnClickWithdraw = useCallback(
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
          {assets.map((asset) => (
            <tr>
              <th>
                <ModalForm
                  type="supply"
                  assetInfo={asset}
                  onChangeInput={handleOnChangeAmount}
                  onClickSupply={handleOnClickSupply}
                  onClickWithdraw={handleOnClickWithdraw}
                  onClickEnable={handleOnClickEnable}
                ></ModalForm>
              </th>
              <td>0.1%</td>
              <td>{asset.walletBalance}</td>
              <td>{asset.underlyingBalance}</td>
              <td>
                <div>
                  <CustomInput
                    onChange={async (e) => await handleOnChangeCollateral(e, asset)}
                    type="switch"
                    checked={asset.hasCollateral}
                    id="swithEthCollateral"
                    name="customSwitch"
                    disabled={asset.underlyingBalance ? false : true}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tbody></tbody>
      </Table>
    </>
  );
};

export default Supply;
