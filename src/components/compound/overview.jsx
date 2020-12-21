import { Jumbotron, Container } from 'reactstrap';
import ConnectionBanner from '@rimble/connection-banner';
import { useWeb3React } from '@web3-react/core';
import { useState, useCallback, useEffect, useContext } from 'react';
import ABIs from '../../abi/contracts.json';
import { roundToTwo } from '../../utils/utils.js';
import { CompoundLensContext } from '../../contexts/compoundLensContexts';
import _ from 'lodash';

const Overview = () => {
  const web3Context = useWeb3React();
  const lensContext = useContext(CompoundLensContext);
  const [lensValues, setLensValue] = useState({
    assetInfo: {},
    accountInfo: {},
    cf: {},
  });
  // const [comptroller] = useState({
  //   address: process.env.REACT_APP_COMPTROLLER_ADDRESS,
  //   abi: JSON.parse(ABIs.Comptroller.abi),
  // });

  // const [liquidity, setLiquidity] = useState(0);

  useEffect(() => {
    if (web3Context.active && !_.isEmpty(lensContext.compoundLensValues)) {
      console.log(lensContext.compoundLensValues);

      setLensValue(lensContext.compoundLensValues);

      // calcSupplyBalance();
      // getCollateralFactors();
    }
  });

  // const calcSupplyBalance = useCallback(async () => {
  //   const walletAddress = web3Context.account;
  //   const ethLibrary = web3Context.library.eth;

  //   const comptrollerInstance = new ethLibrary.Contract(comptroller.abi, comptroller.address);

  //   let { 1: liquidity } = await comptrollerInstance.methods.getAccountLiquidity(walletAddress).call();
  //   liquidity = liquidity / 1e18;

  //   setLiquidity(roundToTwo(liquidity));

  // }, [web3Context, comptroller]);

  // const getCollateralFactors = useCallback(async () => {
  //   const walletAddress = web3Context.account;
  //   const ethLibrary = web3Context.library.eth;

  //   const comptrollerContract = new ethLibrary.Contract(comptroller.abi, comptroller.address);

  //   const results = await comptrollerContract.methods.getAssetsIn(walletAddress).call();
  //   // console.log(results);

  //   // results.forEach(async (assetAddress) => {
  //   //   let assetBalance = await comptrollerContract.methods.markets(assetAddress).call();
  //   //   let { 1: collateralFactorForAsset } = await comptrollerContract.methods.markets(assetAddress).call();
  //   // });

  //   let collateralFactor;
  // }, [web3Context, comptroller]);

  return (
    <Jumbotron fluid>
      <Container fluid>
        <ConnectionBanner
          currentNetwork={web3Context.chainId}
          requiredNetwork={+process.env.REACT_APP_REQUIRED_NETWORK}
          onWeb3Fallback={!web3Context.active && !web3Context.error}
        ></ConnectionBanner>
        <div className="d-flex justify-content-around">
          <p>
            <b>Supply Balance</b>
            <br />${lensValues.accountInfo.liquidity}
          </p>
          <p>Borrow Balance</p>
        </div>
        <div className="text-center">
          <p>
            <b>Borrow Limit</b>
          </p>
        </div>
      </Container>
    </Jumbotron>
  );
};

export default Overview;
