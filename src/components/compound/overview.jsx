import { Jumbotron, Container } from 'reactstrap';
import ConnectionBanner from '@rimble/connection-banner';
import { useWeb3React } from '@web3-react/core';
import { useState, useCallback, useEffect } from 'react';
import ABIs from '../../abi/contracts.json';
import { roundToTwo } from '../../utils/utils.js';

const Overview = () => {
  const web3Context = useWeb3React();

  const [comptroller] = useState({
    address: process.env.REACT_APP_COMPTROLLER_ADDRESS,
    abi: JSON.parse(ABIs.Comptroller.abi),
  });

  const [liquidity, setLiquidity] = useState(0);

  useEffect(() => {
    if (web3Context.active) {
      calcSupplyBalance();
    }
  });

  const calcSupplyBalance = useCallback(async () => {
    const walletAddress = web3Context.account;
    const ethLibrary = web3Context.library.eth;

    const comptrollerInstance = new ethLibrary.Contract(comptroller.abi, comptroller.address);

    let { 1: liquidity } = await comptrollerInstance.methods.getAccountLiquidity(walletAddress).call();
    liquidity = liquidity / 1e18;

    setLiquidity(roundToTwo(liquidity));

    //! To Delete
    let { 1: collateralFactorEth } = await comptrollerInstance.methods
      .markets(process.env.REACT_APP_CETH_ADDRESS)
      .call();
    collateralFactorEth = (collateralFactorEth / 1e18) * 100; // Convert to percent
    let { 1: collateralFactorDai } = await comptrollerInstance.methods
      .markets(process.env.REACT_APP_CDAI_ADDRESS)
      .call();
    collateralFactorDai = (collateralFactorDai / 1e18) * 100; // Convert to percent

    console.log({ collateralFactorEth });
    console.log({ collateralFactorDai });
  }, [web3Context, comptroller]);

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
            <br />${liquidity}
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
