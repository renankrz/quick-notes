/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';

import MarkdownBlock from './MarkdownBlock';

import './Card.css';

import updateImg from '../img/update.svg';
import deleteImg from '../img/delete.svg';

const Card = ({
  id, group, title, markdown, onClickUpdate, onClickDelete,
}) => (
  <div className="card">
    <div className="title-container">
      <span className="group">
        {`[${group}]`}
        :&nbsp;
      </span>
      <span className="title">
        {title}
      </span>
    </div>
    <MarkdownBlock markdown={markdown} />
    <div className="buttons-container">
      <img
        src={updateImg}
        className="button"
        role="button"
        alt="update"
        onClick={() => onClickUpdate(id, group, title, markdown)}
      />
      <img
        src={deleteImg}
        className="button"
        role="button"
        alt="delete"
        onClick={() => onClickDelete(id)}
      />
    </div>
  </div>
);

Card.propTypes = {
  id: PropTypes.string.isRequired,
  group: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  markdown: PropTypes.string.isRequired,
  onClickUpdate: PropTypes.func.isRequired,
  onClickDelete: PropTypes.func.isRequired,
};

export default Card;
