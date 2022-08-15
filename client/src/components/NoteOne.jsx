import * as React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { readRandomNote } from '../api/notes';
import Content from './Content';

function NoteOne({ categoriesKeys }) {
  const [note, setNote] = React.useState([]);

  const { isLoading } = useQuery(
    ['noteOne', categoriesKeys],
    () => readRandomNote(categoriesKeys),
    {
      onSuccess: (data) => {
        setNote(data);
      },
    },
  );

  return isLoading ? (
    <h1>Loading</h1>
  ) : (
    <div>
      <h1 style={{ textAlign: 'center' }}>Random Note</h1>
      {note
        && (
          <div>
            <Content content={note.data} />
          </div>
        )}
    </div>
  );
}

NoteOne.propTypes = {
  categoriesKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default NoteOne;
