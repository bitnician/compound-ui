import React, { useState } from 'react';
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Card,
  Button,
  CardTitle,
  CardText,
  Row,
  Col,
} from 'reactstrap';
import classnames from 'classnames';

const TabExample = (props) => {
  const [activeTab, setActiveTab] = useState(0);

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <div>
      <Nav tabs>
        {props.tabs.map((tab, i) => (
          <NavItem key={i}>
            <NavLink
              style={{ cursor: 'pointer' }}
              className={classnames({ active: activeTab === i })}
              onClick={() => {
                toggle(i);
              }}
            >
              {tab.title}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
      <TabContent activeTab={activeTab}>
        {props.tabs.map((tab, i) => (
          <TabPane tabId={i} key={i}>
            <Row>
              <Col sm="12">{tab.markUp}</Col>
            </Row>
          </TabPane>
        ))}
      </TabContent>
    </div>
  );
};

export default TabExample;
