import React from 'react';
import ReactDOM from 'react-dom';
import KanbanBoard from './kanban';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<KanbanBoard />, div);
});
