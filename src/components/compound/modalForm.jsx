import React, { Component } from 'react';
import Modal from '../modal';
import Input from '../input';
import Tabs from '../tabs';
import { Button, Container } from 'reactstrap';

class ModalForm extends Component {
  state = {
    value: 0,
  };

  modalMarkUp = (obj) => {
    const supplyTab = { title: 'Supply', markUp: this.supplyMarkUp({ ...obj }) };
    const withdrawTab = { title: 'Withdraw', markUp: this.withdrawMarkUp({ ...obj }) };
    const modalTabs = [supplyTab, withdrawTab];

    let markUp;

    if (obj.isErc20 && !obj.isApproved) {
      markUp = this.enableMarkUp(obj);
    }

    if ((obj.isErc20 && obj.isApproved) || !obj.isErc20) {
      markUp = (
        <Container fluid>
          <div>
            <Input name="value" type="number" onChange={this.props.onChangeInput} label={obj.title}></Input>
          </div>
          <div>
            <Tabs tabs={modalTabs}></Tabs>
          </div>
        </Container>
      );
    }

    return markUp;
  };

  enableMarkUp = (obj) => {
    const markUp = (
      <Container fluid>
        <div>
          <p>To Supply or Repay {obj.title} Stablecoin to the Compound Protocol, you need to enable it first.</p>
        </div>
        <div>
          <Button onClick={() => this.props.onClickEnable(obj)} color="primary">
            Enable
          </Button>
        </div>
      </Container>
    );

    return markUp;
  };

  supplyMarkUp = (obj) => {
    const markup = (
      <div>
        <h4>Supply Rate</h4>
        <p>Supply APY: {obj.supplyAPY}</p>
        <p>Distribution APY: {obj.distributionAPY}</p>
        <hr />
        <h4>Borrow Limit</h4>
        <p>Borrow Limit: {obj.borrowLimit}</p>
        <p>Borrow Limit Used: {obj.borrowLimitUsed}</p>
        <hr />
        <Button onClick={this.props.onClickSupply} color="primary">
          Supply
        </Button>
      </div>
    );
    return markup;
  };

  withdrawMarkUp = (obj) => {
    const markup = (
      <div>
        <h4>Supply Rate</h4>
        <p>Supply APY: {obj.supplyAPY}</p>
        <p>Distribution APY: {obj.distributionAPY}</p>
        <hr />
        <h4>Borrow Limit</h4>
        <p>Borrow Limit: {obj.borrowLimit}</p>
        <p>Borrow Limit Used: {obj.borrowLimitUsed}</p>
        <hr />
        <Button onClick={this.props.onClickWithdraw} color="primary">
          Withdraw
        </Button>
      </div>
    );
    return markup;
  };

  render() {
    return (
      <Modal buttonLabel={this.props.assetInfo.title} modalTitle={this.props.assetInfo.title}>
        {this.modalMarkUp(this.props.assetInfo)}
      </Modal>
    );
  }
}

export default ModalForm;
