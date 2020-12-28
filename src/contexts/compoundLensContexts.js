import React, {
  Component,
  createContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import ABIs from '../abi/contracts.json';
import addresses from '../abi/addresses.json';
import { roundToTwo, capitalizeFirstLetter } from '../utils/utils';
import { useWeb3React } from '@web3-react/core';

export const CompoundLensContext = createContext();

const CompoundLensProvider = (props) => {
  const web3Context = useWeb3React();
  const [compoundLensContract, setCompoundLensContract] = useState(null);
  const [compoundLensValues, setCompoundLensValues] = useState({});

  const updateCollatral = useCallback((assets, accountMarkets) => {
    return assets.map((asset) => {
      const key = Object.keys(asset)[0];

      accountMarkets.forEach((market) => {
        if (asset[key].cTokenAddress === market) {
          asset[key].hasCollateral = true;
        }
      });
      return asset;
    });
  }, []);

  const updateIsApproved = useCallback(
    async (assets) => {
      const walletAddress = web3Context.account;
      const ethLibrary = web3Context.library.eth;

      const updatedAssetsPromis = assets.map(async (item) => {
        const key = Object.keys(item)[0];

        if (item[key].isERC20) {
          const erc20TokenContract = new ethLibrary.Contract(
            JSON.parse(ABIs.CErc20.abi),
            item[key].underlyingAssetAddress
          );
          const erc20CTokenContract = new ethLibrary.Contract(
            JSON.parse(ABIs.CErc20.abi),
            item[key].cTokenAddress
          );

          const allowance = await erc20TokenContract.methods
            .allowance(walletAddress, item[key].cTokenAddress)
            .call();

          if (allowance && allowance > 0) {
            item[key].isApproved = true;
          }
        }

        return item;
      });

      const updatedAssets = await Promise.all(updatedAssetsPromis);

      return updatedAssets;
    },
    [web3Context]
  );

  const getLensValues = useCallback(
    async (compoundLensContract) => {
      const walletAddress = web3Context.account;

      const methods = compoundLensContract.methods;
      const cTokenAddresses = addresses.CTokens;
      const cTokenAddressesValuesArray = Object.values(cTokenAddresses);
      const cTokenAddressesKeysArray = Object.keys(cTokenAddresses);

      const cTokenBalancesAll = await methods
        .cTokenBalancesAll(cTokenAddressesValuesArray, walletAddress)
        .call();
      const cTokenMetadataAll = await methods
        .cTokenMetadataAll(cTokenAddressesValuesArray)
        .call();

      const getAccountLimits = await methods
        .getAccountLimits(
          process.env.REACT_APP_COMPTROLLER_ADDRESS,
          walletAddress
        )
        .call();

      const assetInfo = cTokenAddressesValuesArray.map((address, index) => {
        const item0 = cTokenBalancesAll.find((el) => el[0] === address);
        const item1 = cTokenMetadataAll.find((el) => el[0] === address);
        const blocksPerDay = 4 * 60 * 24;
        const daysPerYear = 365;
        return {
          [cTokenAddressesKeysArray[index]]: {
            // name: cTokenAddressesKeysArray[index].substring(1).toUpperCase(),
            name: capitalizeFirstLetter(
              cTokenAddressesKeysArray[index].substring(1)
            ),

            balanceOf: roundToTwo(
              item0.balanceOf / Math.pow(10, item1.cTokenDecimals)
            ),
            balanceOfReal: item0.balanceOf,
            balanceOfUnderlying: roundToTwo(
              item0.balanceOfUnderlying / Math.pow(10, item1.underlyingDecimals)
            ),
            balanceOfUnderlyingReal: item0.balanceOfUnderlying,
            borrowBalanceCurrent: roundToTwo(
              item0.borrowBalanceCurrent /
                Math.pow(10, item1.underlyingDecimals)
            ),
            borrowBalanceCurrentReal: item0.borrowBalanceCurrent,
            accruedBalance:
              item0.borrowBalanceCurrent /
                Math.pow(10, item1.underlyingDecimals) -
              item0.tokenBalance / Math.pow(10, item1.underlyingDecimals),
            cTokenAddress: item0.cToken,
            tokenAllowance: item0.tokenAllowance,
            tokenBalance: roundToTwo(
              item0.tokenBalance / Math.pow(10, item1.underlyingDecimals)
            ),
            tokenBalanceReal: item0.tokenBalance,
            borrowRatePerBlock: item1.borrowRatePerBlock,
            borrowAPY: roundToTwo(
              (Math.pow(
                (item1.borrowRatePerBlock / `${1}e${18}`) * blocksPerDay + 1,
                daysPerYear - 1
              ) -
                1) *
                100
            ),
            borrowAPYReal:
              (Math.pow(
                (item1.borrowRatePerBlock / `${1}e${18}`) * blocksPerDay + 1,
                daysPerYear - 1
              ) -
                1) *
              100,
            cTokenDecimals: item1.cTokenDecimals,
            collateralFactor:
              (item1.collateralFactorMantissa /
                Math.pow(10, item1.underlyingDecimals)) *
              100,
            collateralFactorReal: item1.collateralFactorMantissa,
            hasCollateral: false,
            exchangeRateCurrent: item1.exchangeRateCurrent,
            reserveFactorMantissa: item1.reserveFactorMantissa,
            supplyRatePerBlock: item1.supplyRatePerBlock,

            supplyAPY: roundToTwo(
              (Math.pow(
                (item1.supplyRatePerBlock / +`${1}e${18}`) * blocksPerDay + 1,
                daysPerYear - 1
              ) -
                1) *
                100
            ),
            supplyAPYReal:
              (Math.pow(
                (item1.supplyRatePerBlock / +`${1}e${18}`) * blocksPerDay + 1,
                daysPerYear - 1
              ) -
                1) *
              100,
            totalBorrows: item1.totalBorrows,
            totalCash: item1.totalCash,
            totalReserves: item1.totalReserves,
            totalSupply: item1.totalSupply,
            underlyingAssetAddress: item1.underlyingAssetAddress,
            underlyingDecimals: item1.underlyingDecimals,
            isERC20:
              cTokenAddressesKeysArray[index].substring(1).toUpperCase() ===
              'ETH'
                ? false
                : true,

            isApproved: false,
          },
        };
      });

      const accountInfo = {
        liquidity: roundToTwo(getAccountLimits.liquidity / 1e18),
        markets: getAccountLimits.markets,
        shortfall: getAccountLimits.shortfall,
      };

      const collateralFactors = accountInfo.markets.map((market) => {
        const asset = assetInfo.find(
          (el) => Object.values(el)[0].cTokenAddress === market
        );
        return (
          Object.values(asset)[0].collateralFactor *
          Object.values(asset)[0].balanceOfUnderlying
        );
      });

      const collateralFactorSum = eval(collateralFactors.join('+'));

      let updatedAssetInfo = await updateIsApproved(assetInfo);

      updatedAssetInfo = updateCollatral(updatedAssetInfo, accountInfo.markets);

      setCompoundLensValues({
        assetInfo: updatedAssetInfo,
        accountInfo,
        cf: collateralFactorSum,
      });
    },
    [web3Context, updateIsApproved, updateCollatral]
  );

  useEffect(() => {
    if (web3Context.active && compoundLensContract === null) {
      const ethLibrary = web3Context.library.eth;

      const lensInstance = new ethLibrary.Contract(
        JSON.parse(ABIs.CompoundLens.abi),
        process.env.REACT_APP_COUMPOND_LENS
      );

      setCompoundLensContract(lensInstance);
    }

    if (web3Context.active && compoundLensContract !== null) {
      getLensValues(compoundLensContract);
    }
  }, [web3Context, compoundLensContract, getLensValues]);

  const updatecompoundLensValues = useCallback(async () => {
    await getLensValues(compoundLensContract);
  }, [getLensValues, compoundLensContract]);

  return (
    <CompoundLensContext.Provider
      value={{
        compoundLensContract,
        compoundLensValues,
        updatecompoundLensValues,
      }}
    >
      {props.children}
    </CompoundLensContext.Provider>
  );
};

export default CompoundLensProvider;
