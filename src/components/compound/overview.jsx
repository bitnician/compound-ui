import { Jumbotron, Container } from 'reactstrap';
import ConnectionBanner from '@rimble/connection-banner';
import { useWeb3React } from '@web3-react/core';

const Overview = () => {
  const web3Context = useWeb3React();
  return (
    <Jumbotron fluid>
      <Container fluid>
        <ConnectionBanner
          currentNetwork={web3Context.chainId}
          requiredNetwork={+process.env.REACT_APP_REQUIRED_NETWORK}
          onWeb3Fallback={!web3Context.active && !web3Context.error}
        ></ConnectionBanner>
        <div className="d-flex justify-content-around">
          <p>Supply Balance</p>
          <p>Borrow Balance</p>
        </div>
        <div className="text-center">
          <p>Borrow Limit</p>
        </div>
      </Container>
    </Jumbotron>
  );
};

export default Overview;
