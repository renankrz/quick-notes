import React from 'react';
import PropTypes from 'prop-types';

import Button from './Button';

import './LeftMenu.css';

// eslint-disable-next-line no-unused-vars
const LeftMenu = ({ groups, selectedGroup, onClickGroup }) => (
  <div className="left-menu dark-bg">
    {groups.map((group) => (
      <Button
        key={group}
        text={group}
        cssClasses={`group-button ${group === selectedGroup && 'group-button-active'}`}
        onClick={onClickGroup}
      />
    ))}
  </div>
);

LeftMenu.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedGroup: PropTypes.string.isRequired,
  onClickGroup: PropTypes.func.isRequired,
};

export default LeftMenu;
