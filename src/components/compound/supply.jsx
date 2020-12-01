import React, { useContext } from 'react';
import { Table, CustomInput, Container } from 'reactstrap';
import { ContractContext } from '../../contexts/contractContext';
import Modal from '../modal';
import Input from '../input';
import Tabs from '../tabs';

const modalMarkUp = (obj) => {
  const supplyTab = { title: 'Supply', markUp: supplyMarkUp({ ...obj }) };
  const withdrawTab = { title: 'Withdraw', markUp: withdrawMarkUp({ ...obj }) };
  const modalTabs = [supplyTab, withdrawTab];

  const markUp = (
    <Container fluid>
      <div>
        <Input label={obj.title}></Input>
      </div>
      <div>
        <Tabs tabs={modalTabs}></Tabs>
      </div>
    </Container>
  );
  return markUp;
};

const supplyMarkUp = (obj) => {
  const markup = (
    <div>
      <h4>Supply Rate</h4>
      <p>Supply APY: {obj.supplyAPY}</p>
      <p>Distribution APY: {obj.distributionAPY}</p>
      <hr />
      <h4>Borrow Limit</h4>
      <p>Borrow Limit: {obj.borrowLimit}</p>
      <p>Borrow Limit Used: {obj.borrowLimitUsed}</p>
    </div>
  );
  return markup;
};
const withdrawMarkUp = (obj) => {
  const markup = (
    <div>
      <h4>Supply Rate</h4>
      <p>Supply APY: {obj.supplyAPY}</p>
      <p>Distribution APY: {obj.distributionAPY}</p>
      <hr />
      <h4>Borrow Limit</h4>
      <p>Borrow Limit: {obj.borrowLimit}</p>
      <p>Borrow Limit Used: {obj.borrowLimitUsed}</p>
    </div>
  );
  return markup;
};

const Supply = (props) => {
  const { getContract } = useContext(ContractContext);

  const modalContent = modalMarkUp({
    title: 'Ether',
    supplyAPY: 12.4,
    distributionAPY: 0,
    borrowLimit: 7.07,
    borrowLimitUsed: 0,
    walletBalance: 0.1386,
  });
  return (
    <>
      <h2 className="mb-5">Supply</h2>
      <Table borderless>
        <thead>
          <tr>
            <th>Asset</th>
            <th>APY</th>
            <th>Wallet</th>
            <th>Collateral</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              <Modal buttonLabel="Ether" modalTitle="Ether">
                {modalContent}
              </Modal>
            </th>
            <td>0.1%</td>
            <td>0</td>
            <td>
              <div>
                <CustomInput type="switch" id="exampleCustomSwitch" name="customSwitch" />
              </div>
            </td>
          </tr>
        </tbody>
        <tbody>
          <tr>
            <th>Dai</th>
            <td>0.1%</td>
            <td>0</td>
            <td>
              <div>
                <CustomInput type="switch" id="exampleCustomSwitch" name="customSwitch" />
              </div>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
};

export default Supply;
