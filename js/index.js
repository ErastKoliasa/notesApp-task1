import { extractDates, showElement, hideElement } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
  let lastNoteId = 8;
  let notes = [
    {
      id: 1,
      name: "Health",
      time: '2023-07-31T10:30:00',
      content: "I'm gonna have a dentist appointment on the 3/5/2023, I moved it from 5/5/2023",
      category: "Task",
      datesMentioned: ["3/5/2023", "5/5/2023"],
      archived: false,
    },
    {
      id: 2,
      name: "Shopping",
      time: '2023-07-31 12:30',
      content: 'Remember to buy groceries tomorrow',
      category: 'Task',
      datesMentioned: [],
      archived: false,
    },
    {
      id: 3,
      name: "Rest",
      time: '2023-07-30 16:15',
      content: 'Had a great time at the beach today',
      category: 'Random Thought',
      datesMentioned: [],
      archived: false,
    },
    {
      id: 4,
      name: "New Feature",
      time: '2023-07-29 09:45',
      content: 'Working on a new project idea',
      category: 'Idea',
      datesMentioned: [],
      archived: false,
    },
    {
      id: 5,
      name: "Study",
      time: '2023-07-28 14:20',
      content: 'Need to prepare for the upcoming presentation',
      category: 'Task',
      datesMentioned: [],
      archived: false,
    },
    {
      id: 6,
      name: "Health",
      time: '2023-07-28 09:00',
      content: 'I have a doctor appointment on 2/8/2023',
      category: 'Task',
      datesMentioned: ['2/8/2023'],
      archived: false,
    },
    {
      id: 7,
      name: "New Feature",
      time: '2023-07-27 18:00',
      content: 'Thinking about redecorating the living room',
      category: 'Idea',
      datesMentioned: [],
      archived: false,
    },
  ];

  const activeNotesTable = document.getElementById("activeNotesTable");
  const archivedNotesTable = document.getElementById("archivedNotesTable");
  const summaryTable = document.getElementById("summaryTable").querySelector("tbody");
  const createNoteButton = document.getElementById("createNote");
  const addNoteForm = document.getElementById("addNoteForm");
  const editNoteForm = document.getElementById("editNoteForm");
  const noteNameInput = document.getElementById("noteName");
  const noteContentInput = document.getElementById("noteContent");
  const noteCategorySelect = document.getElementById("noteCategory");
  const editNoteNameInput = document.getElementById("editNoteName");
  const editNoteContentInput = document.getElementById("editNoteContent");
  const editNoteCategorySelect = document.getElementById("editNoteCategory");
  const editNoteSaveButton = editNoteForm.querySelector("button[type='submit']");

  function renderNotes() {
    activeNotesTable.innerHTML = `
          <thead>
            <tr>
              <th>Name</th>
              <th>Created</th>
              <th>Content</th>
              <th>Category</th>
              <th>Dates</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        `;

    archivedNotesTable.innerHTML = `
          <thead>
            <tr>
              <th>Name</th>
              <th>Created</th>
              <th>Content</th>
              <th>Category</th>
              <th>Dates</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        `;

    notes.map((note) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>${note.name}</td>
            <td>${new Date(note.time).toLocaleString()}</td>
            <td>${note.content}</td>
            <td>${note.category}</td>
            <td>${note.datesMentioned.join(", ")}</td>
            <td class="actions">
              <button class="editButton">Edit</button>
              <button class="archiveButton">${note.archived ? 'Unarchive' : 'Archive'}</button>
              <button class="deleteButton">Delete</button>
            </td>
          `;

      const editButton = row.querySelector(".editButton");
      const archiveButton = row.querySelector(".archiveButton");
      const deleteButton = row.querySelector(".deleteButton");

      editButton.addEventListener("click", () => {
        openEditForm(note.id);
      });

      archiveButton.addEventListener("click", () => {
        toggleArchived(note.id);
        renderNotes();
        renderSummary();
      });

      deleteButton.addEventListener("click", () => {
        deleteNote(note.id);
        renderNotes();
        renderSummary();
      });

      if (note.archived) {
        row.classList.add("archived");
        archivedNotesTable.querySelector("tbody").appendChild(row);
      } else {
        activeNotesTable.querySelector("tbody").appendChild(row);
      }
    });
  }

  function renderSummary() {
    summaryTable.innerHTML = "";

    const categories = ["Task", "Random Thought", "Idea"];

    categories.map((category) => {
      const activeCount = notes.filter((note) => note.category === category && !note.archived).length;
      const archivedCount = notes.filter((note) => note.category === category && note.archived).length;

      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${category}</td>
          <td>${activeCount}</td>
          <td>${archivedCount}</td>
        `;
      summaryTable.appendChild(row);
    });
  }

  function toggleArchived(noteId) {
    notes = notes.map((note) => {
      if (note.id === noteId) {
        return {
          ...note,
          archived: !note.archived,
        };
      }
      return note;
    });
  }

  function deleteNote(noteId) {
    notes = notes.filter((note) => note.id !== noteId);
  }

  function openEditForm(noteId) {
    const note = notes.find((note) => note.id === noteId);
    if (note) {
      editNoteNameInput.value = note.name;
      editNoteContentInput.value = note.content;
      editNoteCategorySelect.value = note.category;
      editNoteSaveButton.addEventListener("click", () => {
        saveEditedNote(noteId);
      });
      showElement(editNoteForm);
    }
  }

  function saveEditedNote(noteId) {
    try {
      const noteIndex = notes.findIndex((note) => note.id === noteId);
      if (noteIndex === -1) {
        throw new Error("Note not found");
      }

      const updatedNote = {
        ...notes[noteIndex],
        name: editNoteNameInput.value,
        content: editNoteContentInput.value.trim(),
        category: editNoteCategorySelect.value,
        datesMentioned: extractDates(editNoteContentInput.value),
      };

      notes = [
        ...notes.slice(0, noteIndex),
        updatedNote,
        ...notes.slice(noteIndex + 1),
      ];

      hideElement(editNoteForm);
      editNoteSaveButton.removeEventListener("click", saveEditedNote);
      renderNotes();
      renderSummary();
    } catch (error) {
      console.error("Error saving edited note:", error.message);
    }
  }

  createNoteButton.addEventListener("click", () => showElement(addNoteForm));

  addNoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = noteNameInput.value;
    const content = noteContentInput.value.trim();
    const category = noteCategorySelect.value;

    if (name && content && category) {
      const newNote = {
        id: lastNoteId++,
        name,
        time: new Date().toISOString(),
        content,
        category,
        datesMentioned: extractDates(content),
        archived: false,
      };
      notes.push(newNote);
      noteNameInput.value = "";
      noteContentInput.value = "";
      noteCategorySelect.value = "";
      renderNotes();
      renderSummary();

    }
    hideElement(addNoteForm);
  });

  renderNotes();
  renderSummary();
})