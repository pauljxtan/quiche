import React, { Component } from 'react';
import KanbanBoard from './kanban.js'
import { CookiesProvider } from 'react-cookie';

import 'bulma/css/bulma.css';
import './app.css';

class App extends Component {
  render() {
    return (
      <div className="app">
        <CookiesProvider>
          <KanbanBoard />
        </CookiesProvider>
      </div>
    );
  }
}

export default App;
