/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Button from './Button';
import Form from './Form';
import Header from './Header';
import ListOfCards from './ListOfCards';

import {
  noteCreate, noteRead, noteUpdate, noteDelete,
} from '../api';

import './Main.css';

const Main = ({ selectedGroup, onUpdateGroups }) => {
  const [notesList, setNotesList] = useState([]);
  const [mode, setMode] = useState('random');
  const [noteToUpdate, setNoteToUpdate] = useState({});

  const createNote = async (data) => {
    const createdNote = await noteCreate(data);
    setMode('none');
    setNotesList([createdNote]);
    onUpdateGroups();
  };

  const readRandomNote = async () => {
    setNotesList([].concat(await noteRead(selectedGroup, true)));
  };

  const readAllNotes = async () => {
    setNotesList(await noteRead(selectedGroup, false));
  };

  const updateNote = async (id, updates) => {
    const updatedNote = await noteUpdate(id, updates);
    setMode('none');
    setNotesList([updatedNote]);
    onUpdateGroups();
  };

  const deleteNote = async (id) => {
    await noteDelete(id);
    setNotesList(notesList.filter((note) => note._id !== id));
    onUpdateGroups();
  };

  const clickCreate = () => {
    setMode('create');
  };

  const clickRandom = () => {
    setMode('random');
    readRandomNote();
  };

  const clickAll = () => {
    setMode('all');
    readAllNotes();
  };

  const clickUpdate = (noteId, noteGroup, noteTitle, noteRank, noteMarkdown) => {
    setMode('update');
    setNoteToUpdate({
      id: noteId,
      group: noteGroup,
      title: noteTitle,
      rank: noteRank,
      markdown: noteMarkdown,
    });
  };

  useEffect(() => {
    readRandomNote();
  }, []);

  useEffect(() => {
    if (mode === 'random') {
      readRandomNote();
    } else if (mode === 'all') {
      readAllNotes();
    }
  }, [selectedGroup]);

  return (
    <div className="main-container">
      <Header />
      <div className="main light-bg">
        <div className="menu-buttons-container">
          <Button
            text="Create new"
            cssClasses={`menu-button ${mode === 'create' && 'menu-button-active'}`}
            onClick={clickCreate}
          />
          <Button
            text="Get all"
            cssClasses={`menu-button ${mode === 'all' && 'menu-button-active'}`}
            onClick={clickAll}
          />
          <Button
            text="Get random"
            cssClasses={`menu-button ${mode === 'random' && 'menu-button-active'}`}
            onClick={clickRandom}
          />
        </div>
        <div className="content-container">
          {(mode === 'all' || mode === 'random' || mode === 'none')
            && (
            <ListOfCards
              notesList={notesList}
              onClickUpdate={clickUpdate}
              onClickDelete={deleteNote}
            />
            )}
          {mode === 'create'
            && (
            <Form
              text="CREATE"
              submit={createNote}
            />
            )}
          {mode === 'update'
            && (
            <Form
              noteData={noteToUpdate}
              text="UPDATE"
              submit={updateNote}
            />
            )}
        </div>
      </div>
    </div>
  );
};

Main.propTypes = {
  selectedGroup: PropTypes.string.isRequired,
  onUpdateGroups: PropTypes.func.isRequired,
};

export default Main;
