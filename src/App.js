import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import { createTodo, deleteTodo, updateTodo } from "./graphql/mutations";
import { listTodos } from './graphql/queries';
import { onCreateTodo, onDeleteTodo, onUpdateTodo } from './graphql/subscriptions';

class App extends Component {

  state = {
    id: "",
    note: "",
    notes: []
  }

  componentDidMount() {
      this.getNotes();

      this.createNoteListener = API.graphql(graphqlOperation(onCreateTodo)).subscribe({
        next: noteData => {
          const newNote = noteData.value.data.onCreateTodo;
          const prevNotes = this.state.notes.filter(note => note.id !== newNote.id);
          const updatedNotes = [...prevNotes, newNote];
          this.setState({ notes: updatedNotes });
        }
      });

      this.deleteNoteListener = API.graphql(graphqlOperation(onDeleteTodo)).subscribe({
          next: noteData => {
            const deletedNote = noteData.value.data.onDeleteTodo;
            const updatedNotes = this.state.notes.filter(note => {
              return note.id !== deletedNote.id
            });
            this.setState({ notes: updatedNotes });
          }
      });

      this.updateNoteListener = API.graphql(graphqlOperation(onUpdateTodo)).subscribe({
        
        next: noteData => {
          const { notes } = this.state;
          const updatedNote = noteData.value.data.onUpdateTodo;
          const index = notes.findIndex(note => note.id === updatedNote.id);
          const updatedNotes = [
            ...notes.slice(0, index),
            updatedNote,
            ...notes.slice(index + 1)
          ];
          this.setState({ notes: updatedNotes, note: "", id: ""});
        }
      })
  }

  componentWillUnmount() {
    this.createNoteListener.unsubscribe();
    this.deleteNoteListener.unsubscribe();
    this.updateNoteListener.unsubscribe();
  }

  getNotes = async () => {
    const result = await API.graphql(graphqlOperation(listTodos));
    this.setState({ notes: result.data.listTodos.items });
  }

  handleChangeNote = event => {
    this.setState({ note: event.target.value });
  }

  hasExistingNote = () => {
    const { notes, id } = this.state;
    if (id) {
      // Is the ID valid?
      const isNote = notes.findIndex(note => note.id === id) > -1;
      return isNote;
    }
    return false;
  }

  handleAddNote = async event => {

    const { note } = this.state;

    // Prevent default action of submitting
    // a form, which is to reload the page
    event.preventDefault();

    // Check if we have an existing note
    // of a given ID. If so, we update it.
    if (this.hasExistingNote()) {
      this.handleUpdateNote();

    } else {
      const input = { name: note };
      await API.graphql(graphqlOperation(createTodo, { input }));
      // const newNote = result.data.createTodo;
      // const updatedNotes = [newNote, ...notes];
      this.setState({ note: "" });
    }
  }

  handleUpdateNote = async () => {
    const { id, note } = this.state;
    const input = { id, name: note };
    await API.graphql(graphqlOperation(updateTodo, { input }));
    // const updatedNote = result.data.updateTodo;
    // const index = notes.findIndex(note => note.id === updatedNote.id);
    // const updatedNotes = [
    //   ...notes.slice(0, index),
    //   updatedNote,
    //   ...notes.slice(index + 1)
    // ];
    // this.setState({ notes: updatedNotes, note: "", id: ""});
  }

  handleDeleteNote = async noteId => {
      // const { notes } = this.state;
      const input = { id: noteId };
      await API.graphql(graphqlOperation(deleteTodo, { input }));
      // const deleteNoteId = result.data.deleteTodo.id;
      // const updatedNotes = notes.filter(note => note.id !== deleteNoteId);
      // this.setState({ notes: updatedNotes });
  }

  handleSetNote = ({name, id}) => this.setState({name, id});

  render() {
    const { id, notes, note } = this.state;

    return (
      <div 
        className="flex flex-column items-center justify-center pa3 bg-washed-red"
        >
        <h1 className="code f2-1">Amplify Notetaker</h1>
        {/* Note Form */}
        <form 
          onSubmit={this.handleAddNote}
          className="mb3">
          <input
            type="text"
            className="pa2 f4"
            placeholder="Write your note"
            onChange={this.handleChangeNote}
            value={note}
          />
          <button 
            className="pa2 f4"
            type="submit"
          >
            {id ? "Update Note" : "Add Note"}
          </button>
        </form>

        {/* Notes List */}

        <div>
          {notes.map(item => (
            <div 
              key={item.id}
              className="flex items-center"
            >
              <li
                onClick={() => this.handleSetNote(item)}
                className="list pa1 f3"
              >
                {item.name}
              </li>
              {/* To prevent the delete function from running
              on page load, we turn it into an arrow function. */}
              <button 
                  onClick={() => this.handleDeleteNote(item.id)}
                  className="bg-transparent bn f4">
                  <span>&times;</span>
              </button>
              
            </div>
          ))}
        </div>

      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings : true });
