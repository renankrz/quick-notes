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
        rank={note.rank}
        markdown={note.markdown}
        onClickUpdate={onClickUpdate}
        onClickDelete={onClickDelete}
      />
      )))}
  </div>
);

ListOfCards.propTypes = {
  notesList: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    group: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    rank: PropTypes.number.isRequired,
    markdown: PropTypes.string.isRequired,
  })).isRequired,
  onClickUpdate: PropTypes.func.isRequired,
  onClickDelete: PropTypes.func.isRequired,
};

export default ListOfCards;
