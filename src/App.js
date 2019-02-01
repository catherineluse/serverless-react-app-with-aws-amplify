import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import { createTodo } from "./graphql/mutations";

class App extends Component {

  state = {
    note: "",
    notes: []
  }

  handleChangeNote = event => {
    this.setState({ note: event.target.value });
  }

  handleAddNote = async event => {

    const { note, notes } = this.state;

    // Prevent default action of submitting
    // a form, which is to reload the page
    event.preventDefault();

    const input = { name: note };
    const result = await API.graphql(graphqlOperation(createTodo, { input }));
    const newNote = result.data.createNote;
    const updatedNotes = [newNote, ...notes];
    this.setState({ notes: updatedNotes, note: "" });
  }

  render() {
    const { notes, note } = this.state;

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
            Add Note
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
                className="list pa1 f3"
              >
                {item.note}
              </li>
              <button className="bg-transparent bn f4">
                
              </button>
              <span>&times;</span>
            </div>
          ))}
        </div>

      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings : true });
