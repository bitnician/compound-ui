import React, { Component } from 'react';
import Modal from '../modal';
import Input from '../input';
import Tabs from '../tabs';
import { Button, Container } from 'reactstrap';
import { Eth, Usdt, Usd, Bat, Btc, Dai, Zrx } from '@rimble/icons';
const icons = {
  Eth: <Eth size="40"></Eth>,
  Usdt: <Usdt size="40"></Usdt>,
  Usdc: <Usd size="40"></Usd>,
  Bat: <Bat size="40"></Bat>,
  Wbtc: <Btc size="40"></Btc>,
  Dai: <Dai size="40"></Dai>,
  Zrx: <Zrx size="40"></Zrx>,
};

class ModalForm extends Component {
  state = {
    value: 0,
  };

  modalMarkUp = (asset) => {
    const supplyTab = {
      title: 'Supply',
      markUp: this.supplyMarkUp({ ...asset }),
    };
    const withdrawTab = {
      title: 'Withdraw',
      markUp: this.withdrawMarkUp({ ...asset }),
    };
    const borrowTab = {
      title: 'Borrow',
      markUp: this.borrowMarkUp({ ...asset }),
    };
    const repayTab = { title: 'Repay', markUp: this.repayMarkUp({ ...asset }) };
    let modalTabs;
    if (this.props.type === 'supply') {
      modalTabs = [supplyTab, withdrawTab];
    }
    if (this.props.type === 'borrow') {
      modalTabs = [borrowTab, repayTab];
    }

    let markUp;

    // if (asset.ERC20 && !asset.isApproved) {
    //   markUp = this.enableMarkUp(asset);
    // }

    if ((asset.ERC20 && asset.isApproved) || !asset.ERC20) {
      markUp = (
        <Container fluid>
          <div>
            <Input
              name="value"
              type="number"
              onChange={this.props.onChangeInput}
              label={asset.name}
            ></Input>
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
      <>
        <div>
          <p>
            To Supply or Repay {asset.name} Stablecoin to the Compound Protocol,
            you need to enable it first.
          </p>
        </div>
        <div>
          <Button
            onClick={() => this.props.onClickEnable(asset)}
            color="primary"
          >
            Enable
          </Button>
        </div>
      </>
    );

    return markUp;
  };

  supplyMarkUp = (asset) => {
    if (asset.isERC20 && !asset.isApproved) {
      const markup = this.enableMarkUp(asset);
      return markup;
    }
    if ((asset.isERC20 && asset.isApproved) || !asset.isERC20) {
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
          <Button
            onClick={() => this.props.onClickSupply(asset)}
            color="primary"
          >
            Supply
          </Button>
        </div>
      );
      return markup;
    }
  };

  borrowMarkUp = (asset) => {
    const markup = (
      <div>
        <h4>Borrow Rate</h4>
        <p>Borrow APY: {asset.supplyAPY}</p>
        <p>Distribution APY: {asset.distributionAPY}</p>
        <hr />
        <h4>Borrow Limit</h4>
        <p>Borrow Balance: {asset.borrowLimit}</p>
        <p>Borrow Limit Used: {asset.borrowLimitUsed}</p>
        <hr />
        <Button onClick={() => this.props.onClickBorrow(asset)} color="primary">
          Borrow
        </Button>
      </div>
    );
    return markup;
  };
  repayMarkUp = (asset) => {
    if (asset.isERC20 && !asset.isApproved) {
      const markup = this.enableMarkUp(asset);
      return markup;
    }
    if ((asset.isERC20 && asset.isApproved) || !asset.isERC20) {
      const markup = (
        <div>
          <h4>Borrow Rate</h4>
          <p>Borrow APY: {asset.supplyAPY}</p>
          <p>Distribution APY: {asset.distributionAPY}</p>
          <hr />
          <Button
            onClick={() => this.props.onClickRepay(asset)}
            color="primary"
          >
            Repay
          </Button>
        </div>
      );
      return markup;
    }
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
        <Button
          onClick={() => this.props.onClickWithdraw(asset)}
          color="primary"
        >
          Withdraw
        </Button>
      </div>
    );
    return markup;
  };

  buttonLabel = () => {
    let iconKey = Object.keys(icons).filter(
      (icon) => icon === this.props.assetInfo.name
    )[0];

    const img = icons[iconKey] === undefined ? '' : icons[iconKey];

    const name = this.props.assetInfo.name;
    return (
      <span>
        <span style={{ marginRight: 10 }}>{img}</span> {name}
      </span>
    );
  };

  render() {
    return (
      <Modal
        buttonLabel={this.buttonLabel()}
        modalTitle={this.props.assetInfo.name}
      >
        {this.modalMarkUp(this.props.assetInfo)}
      </Modal>
    );
  }
}

export default ModalForm;
