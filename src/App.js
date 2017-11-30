import React, { Component } from 'react';
import 'bulma/css/bulma.css'
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <KanbanBoard />
      </div>
    );
  }
}

class KanbanBoard extends Component {
  render() {
    return (
      <div className="kanban-board">
        <div className="columns">
          <div className="column">
            <KanbanColumnTodo />
          </div>
          <div className="column">
            <KanbanColumnDoing />
          </div>
          <div className="column">
            <KanbanColumnDone />
          </div>
        </div>
      </div>
    );
  }
}

class KanbanColumn extends Component {
  render() {
    return (
      <div className="kanban-column">
        {this.props.title}
      </div>
    );
  }
}

class KanbanColumnTodo extends Component {
  render() {
    return (
      <div className="kanban-column-todo">
        <KanbanColumn title="To-do" />
      </div>
    );
  }
}

class KanbanColumnDoing extends Component {
  render() {
    return (
      <div className="kanban-column-doing">
        <KanbanColumn title="Doing" />
      </div>
    );
  }
}

class KanbanColumnDone extends Component {
  render() {
    return (
      <div className="kanban-column-done">
        <KanbanColumn title="Done" />
      </div>
    );
  }
}

export default App;
