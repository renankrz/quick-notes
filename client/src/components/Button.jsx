/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
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
