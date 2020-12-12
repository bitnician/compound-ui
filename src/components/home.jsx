import React from 'react';
import { Row, Col, Container } from 'reactstrap';
import _ from 'lodash';
import Supply from './compound/supply';
import Borrow from './compound/borrow';
import Overview from './compound/overview';

export default function Home() {
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
