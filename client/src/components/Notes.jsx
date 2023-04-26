import * as React from "react";
import PropTypes from "prop-types";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Card,
  CardContent,
  Container,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import Content from "./Content";

function Notes({ notes, categoriesPaths, deleteNote, editNote }) {
  return (
    <Container sx={{ maxHeight: "75vh", overflow: "auto" }}>
      {notes.map((note) => (
        <Box sx={{ mb: 4 }} key={note.key}>
          <Card variant="elevation">
            <Box
              sx={{
                background: "#F2F2F2",
                padding: 2,
              }}
            >
              {categoriesPaths
                .filter((c) => c.key === note.categoryKey)
                .map((cat) => (
                  <Typography
                    key={cat.key}
                    variant="body1"
                    sx={{ color: "#353C65", paddingBottom: 1 }}
                  >
                    {cat.names
                      .reduce(
                        (previousValue, currentValue) =>
                          `${previousValue} > ${currentValue}`,
                        ""
                      )
                      .slice(3)}
                  </Typography>
                ))}
              <Typography variant="h5" sx={{ color: "#6977C9" }}>
                {note.title}
              </Typography>
            </Box>
            <CardContent
              sx={{
                paddingTop: 0,
              }}
            >
              <Content content={note.content} />
            </CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                paddingRight: "4px",
                paddingBottom: "4px",
              }}
            >
              <Tooltip title="Edit">
                <IconButton onClick={() => editNote(note)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton onClick={() => deleteNote(note.key)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Card>
        </Box>
      ))}
    </Container>
  );
}

Notes.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      categoryKey: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
      rank: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  categoriesPaths: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      names: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    }).isRequired
  ).isRequired,
  deleteNote: PropTypes.func.isRequired,
  editNote: PropTypes.func.isRequired,
};

export default Notes;
