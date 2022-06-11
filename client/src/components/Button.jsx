import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = ({
  text, onClick, cssClasses,
}) => (
  <div
    className={cssClasses}
    role="button"
    onClick={() => onClick(text)}
  >
    <h2>{text}</h2>
  </div>
);

Button.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  cssClasses: PropTypes.string.isRequired,
};

export default Button;
