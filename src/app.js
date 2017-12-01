import React, { Component } from 'react';
import KanbanBoard from './kanban.js'
import 'bulma/css/bulma.css'
import './app.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <KanbanBoard />
      </div>
    );
  }
}
export default App;
