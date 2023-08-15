import * as React from "react";
import { Box, Button, Container, Divider } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { readCategoriesRich, readRoot } from "../api/categories";
import {
  createNote,
  deleteNote,
  readAllNotes,
  readRandomNote,
  updateNote,
} from "../api/notes";
import Categories from "./Categories";
import Form from "./Form";
import Header from "./Header";
import Notes from "./Notes";

import "./style/App.css";

function App() {
  const [interactionMode, setInteractionMode] = React.useState("view");
  const [notesViewMode, setNotesViewMode] = React.useState("random");
  const [noteToEdit, setNoteToEdit] = React.useState(null);
  const [expandedCategories, setExpandedCategories] = React.useState([]);
  const [selectedCategories, setSelectedCategories] = React.useState([]);
  const categoriesPaths = React.useRef([]);
  const expandableNodes = React.useRef([]);
  const selectableNodes = React.useRef([]);

  const queryRoot = useQuery(["queryRoot"], readRoot, {
    onSuccess: (data) => {
      setSelectedCategories([data._key]);
    },
  });

  const queryCategories = useQuery(["categories"], readCategoriesRich, {
    onSuccess: (data) => {
      // All categories with key and name
      categoriesPaths.current = data.paths;
      // Keys of nodes that have children
      expandableNodes.current = [...new Set(data.edges.map((e) => e.from))];
      // Keys of all nodes
      selectableNodes.current = data.vertices.map((v) => v.key);
    },
  });

  const queryRandom = useQuery(["queryRandom", selectedCategories], () =>
    readRandomNote(selectedCategories)
  );

  const queryAll = useQuery(["queryAll", selectedCategories], () =>
    readAllNotes(selectedCategories)
  );

  const handleExpand = (event, nodeIds) => {
    setExpandedCategories(nodeIds);
  };

  const handleExpandAllClick = () => {
    setExpandedCategories((old) =>
      old.length === 0 ? expandableNodes.current : []
    );
  };

  const handleSelect = (event, nodeIds) => {
    setSelectedCategories(nodeIds);
  };

  const handleSelectAllClick = () => {
    setSelectedCategories((old) =>
      old.length === 0 ? selectableNodes.current : []
    );
  };

  const handleToggleModeClick = () => {
    setInteractionMode(interactionMode === "view" ? "create" : "view");
  };

  const handleAllClick = () => {
    setNotesViewMode("all");
  };

  const handleRandomClick = async () => {
    if (notesViewMode === "random") {
      await queryRandom.refetch();
    } else {
      setNotesViewMode("random");
    }
  };

  const handleCreateNoteClick = async (data) => {
    await createNote(data);
    setInteractionMode("view");
    if (notesViewMode === "all") {
      await queryAll.refetch();
    } else {
      await queryRandom.refetch();
    }
  };

  const handleEditNoteClick = async (key, data) => {
    await updateNote(key, data);
    setInteractionMode("view");
    if (notesViewMode === "all") {
      await queryAll.refetch();
    } else {
      await queryRandom.refetch();
    }
  };

  const handleDeleteClick = async (key) => {
    await deleteNote(key);
    if (notesViewMode === "all") {
      await queryAll.refetch();
    } else {
      await queryRandom.refetch();
    }
  };

  const handleEditClick = async (note) => {
    setNoteToEdit(note);
    setInteractionMode("edit");
  };

  return (
    <Container sx={{ minWidth: "95vw" }}>
      <Header />
      <Box sx={{ display: "flex" }}>
        <Box sx={{ width: "300px", height: "80vh", overflow: "auto" }}>
          {queryCategories.isSuccess && (
            <Categories
              categories={queryCategories.data.categories}
              expanded={expandedCategories}
              handleExpand={handleExpand}
              handleExpandAllClick={handleExpandAllClick}
              selected={selectedCategories}
              handleSelect={handleSelect}
              handleSelectAllClick={handleSelectAllClick}
            />
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            minWidth: "100px",
          }}
        >
          <Divider orientation="vertical" />
        </Box>
        <Box sx={{ width: "66.7%", margin: "0 auto" }}>
          <Box sx={{ mb: 1, display: "flex" }}>
            <Button onClick={handleAllClick} sx={{ width: "120px" }}>
              get all
            </Button>
            <Button onClick={handleRandomClick} sx={{ width: "120px" }}>
              get random
            </Button>
            <Button onClick={handleToggleModeClick} sx={{ width: "120px" }}>
              {interactionMode === "view" ? "create new" : "view notes"}
            </Button>
          </Box>
          {interactionMode === "view" &&
            queryAll.fetchStatus === "idle" &&
            queryRandom.fetchStatus === "idle" &&
            queryCategories.fetchStatus === "idle" && (
              <Notes
                notes={
                  notesViewMode === "all" ? queryAll.data : queryRandom.data
                }
                categoriesPaths={categoriesPaths.current}
                deleteNote={handleDeleteClick}
                editNote={handleEditClick}
              />
            )}
          {interactionMode === "create" && (
            <Form
              categoriesPaths={categoriesPaths.current}
              notePrefilledData={{
                categoryKey:
                  selectedCategories.length === 1 ? selectedCategories[0] : "",
                content: "",
                key: "",
                rank: 0,
                title: "",
              }}
              submit={handleCreateNoteClick}
              submitButtonText="create"
            />
          )}
          {interactionMode === "edit" && (
            <Form
              categoriesPaths={categoriesPaths.current}
              notePrefilledData={noteToEdit}
              submit={handleEditNoteClick}
              submitButtonText="save"
            />
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default App;
