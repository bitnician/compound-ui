import React from 'react';
import { InputGroup, InputGroupText, InputGroupAddon, Input } from 'reactstrap';

const InputExample = (props) => {
  return (
    <div>
      <InputGroup>
        <Input onChange={props.onChange} name={props.name} type={props.type} />
        <InputGroupAddon addonType="append">
          <InputGroupText>{props.label}</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

export default InputExample;
