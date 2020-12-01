import { Jumbotron, Container } from 'reactstrap';
import ConnectionBanner from '@rimble/connection-banner';
import { useWeb3Context } from 'web3-react';

const Overview = () => {
  const web3Context = useWeb3Context();
  return (
    <Jumbotron fluid>
      <Container fluid>
        <ConnectionBanner
          currentNetwork={web3Context.networkId}
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
