/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';

import Card from './Card';

import './ListOfCards.css';

const ListOfCards = ({ notesList, onClickUpdate, onClickDelete }) => (
  <div className="list-of-cards">
    {notesList.map((note) => (
      note && (
      <Card
        key={note._id}
        id={note._id}
        group={note.group}
        title={note.title}
        markdown={note.markdown}
        onClickUpdate={onClickUpdate}
        onClickDelete={onClickDelete}
      />
      )))}
  </div>
);

ListOfCards.propTypes = {
  notesList: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    group: PropTypes.string,
    title: PropTypes.string,
    markdown: PropTypes.string,
  })).isRequired,
  onClickUpdate: PropTypes.func.isRequired,
  onClickDelete: PropTypes.func.isRequired,
};

export default ListOfCards;
