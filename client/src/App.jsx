import React, { useState, useEffect } from 'react';
import LeftMenu from './components/LeftMenu';
import Main from './components/Main';
import { groupsRead } from './api';
import './App.css';

const App = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('All');

  const updateGroups = async () => {
    const response = await groupsRead();
    setGroups(['All', ...response]);
  };

  useEffect(() => {
    async function firstUpdateGroups() {
      const response = await groupsRead();
      setGroups(['All', ...response]);
    }
    firstUpdateGroups();
  }, []);

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
