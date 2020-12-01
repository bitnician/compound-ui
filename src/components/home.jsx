import React, { useEffect, useContext } from 'react';
import { Jumbotron, Container, Row, Col } from 'reactstrap';
import { useWeb3Context } from 'web3-react';
import { EthContext } from '../contexts/ethContext';
import _ from 'lodash';
import Supply from './compound/supply';
import Borrow from './compound/borrow';
import Overview from './compound/overview';

export default function Home() {
  const web3Context = useWeb3Context();
  const { ethLibrary, setEthLibrary } = useContext(EthContext);

  useEffect(() => {
    web3Context.setFirstValidConnector(['MetaMask', 'Infura']);
  }, []);

  useEffect(() => {
    if (_.isEmpty(ethLibrary) && !_.isEmpty(web3Context.library)) setEthLibrary(web3Context.library.eth);
  });

  // let p;

  // if (!web3Context.active && !web3Context.error) {
  //   // loading
  //   p = <p>loading</p>;
  // } else if (web3Context.error) {
  //   //error
  //   p = <p>Error</p>;
  // } else {
  //   // success
  //   p = <p>success,{web3Context.account}</p>;
  // }

  return (
    <>
      <div>
        <header>
          <Overview></Overview>
        </header>
        <main>
          <Container>
            <Row>
              <Col xs="6">
                <Supply></Supply>
              </Col>
              <Col xs="6">
                <Borrow></Borrow>
              </Col>
            </Row>
          </Container>
        </main>
      </div>
    </>
  );
}
