import React, { useState, useEffect } from 'react';
import LeftMenu from './components/LeftMenu';
import Main from './components/Main';
import { groupRead } from './api';
import './App.css';

const App = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('All');

  const updateGroups = async () => {
    const readGroups = await groupRead();
    setGroups(['All', ...readGroups]);
  };

  useEffect(updateGroups, []);

  return (
    <div className="app">
      <LeftMenu
        groups={groups}
        selectedGroup={selectedGroup}
        onClickGroup={(group) => setSelectedGroup(group)}
      />
      <Main
        selectedGroup={selectedGroup}
        onUpdateGroups={updateGroups}
      />
    </div>
  );
};

export default App;
