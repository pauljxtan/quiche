import React, {Component} from 'react';
import Board from './kanban.js'

import 'bulma/css/bulma.css';
import './app.css';

class App extends Component {
  render() {
    return (
      <div className="app">
        <Board/>
      </div>
    );
  }
}

export default App;
