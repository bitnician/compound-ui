import React, { Component } from 'react';
import Modal from '../modal';
import Input from '../input';
import Tabs from '../tabs';
import { Button, Container } from 'reactstrap';

class ModalForm extends Component {
  state = {
    value: 0,
  };

  modalMarkUp = (asset) => {
    const supplyTab = { title: 'Supply', markUp: this.supplyMarkUp({ ...asset }) };
    const withdrawTab = { title: 'Withdraw', markUp: this.withdrawMarkUp({ ...asset }) };
    const modalTabs = [supplyTab, withdrawTab];

    let markUp;

    if (asset.isErc20 && !asset.isApproved) {
      markUp = this.enableMarkUp(asset);
    }

    if ((asset.isErc20 && asset.isApproved) || !asset.isErc20) {
      markUp = (
        <Container fluid>
          <div>
            <Input name="value" type="number" onChange={this.props.onChangeInput} label={asset.title}></Input>
          </div>
          <div>
            <Tabs tabs={modalTabs}></Tabs>
          </div>
        </Container>
      );
    }

    return markUp;
  };

  enableMarkUp = (asset) => {
    const markUp = (
      <Container fluid>
        <div>
          <p>
            To Supply or Repay {asset.title.toUpperCase()} Stablecoin to the Compound Protocol, you need to enable it
            first.
          </p>
        </div>
        <div>
          <Button onClick={() => this.props.onClickEnable(asset)} color="primary">
            Enable
          </Button>
        </div>
      </Container>
    );

    return markUp;
  };

  supplyMarkUp = (asset) => {
    const markup = (
      <div>
        <h4>Supply Rate</h4>
        <p>Supply APY: {asset.supplyAPY}</p>
        <p>Distribution APY: {asset.distributionAPY}</p>
        <hr />
        <h4>Borrow Limit</h4>
        <p>Borrow Limit: {asset.borrowLimit}</p>
        <p>Borrow Limit Used: {asset.borrowLimitUsed}</p>
        <hr />
        <Button onClick={() => this.props.onClickSupply(asset)} color="primary">
          Supply
        </Button>
      </div>
    );
    return markup;
  };

  withdrawMarkUp = (asset) => {
    const markup = (
      <div>
        <h4>Supply Rate</h4>
        <p>Supply APY: {asset.supplyAPY}</p>
        <p>Distribution APY: {asset.distributionAPY}</p>
        <hr />
        <h4>Borrow Limit</h4>
        <p>Borrow Limit: {asset.borrowLimit}</p>
        <p>Borrow Limit Used: {asset.borrowLimitUsed}</p>
        <hr />
        <Button onClick={() => this.props.onClickWithdraw(asset)} color="primary">
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
