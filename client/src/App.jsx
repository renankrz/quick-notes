import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import LeftMenu from './components/LeftMenu';
import Main from './components/Main';
import { groupsRead } from './api';
import './App.css';

const App = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('All');

  const { isLoading } = useQuery('updateGroups', groupsRead, {
    onSuccess: (data) => {
      setGroups(['All', ...data]);
    },
  });
  const queryClient = useQueryClient();

  return isLoading ? (
    <h1>Loading</h1>
  ) : (
    <div className="app">
      <LeftMenu
        groups={groups}
        selectedGroup={selectedGroup}
        onClickGroup={(group) => setSelectedGroup(group)}
      />
      <Main
        selectedGroup={selectedGroup}
        onUpdateGroups={() => queryClient.invalidateQueries('updateGroups')}
      />
    </div>
  );
};

export default App;
