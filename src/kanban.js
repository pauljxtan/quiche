import React, { Component } from 'react';
import './kanban.css';

class KanbanBoard extends Component {
  render() {
    return (
      <div className="kanban-board">
        <div className="columns">
            <KanbanColumnTodo />
            <KanbanColumnDoing />
            <KanbanColumnDone />
        </div>
      </div>
    );
  }
}

class KanbanColumnTodo extends Component {
  render() {
    return (
      <div className="column is-third kanban-column-todo">
        <KanbanColumn title="To-do" />
      </div>
    );
  }
}

class KanbanColumnDoing extends Component {
  render() {
    return (
      <div className="column is-third kanban-column-doing">
        <KanbanColumn title="Doing" />
      </div>
    );
  }
}

class KanbanColumnDone extends Component {
  render() {
    return (
      <div className="column is-third kanban-column-done">
        <KanbanColumn title="Done" />
      </div>
    );
  }
}

class KanbanColumn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
    };
  }

  addTask(title, dueDate) {
    let task = {
      title: title,
      dueDate: dueDate
    };
    this.setState({
      tasks: this.state.tasks.concat([task])
    });
    console.log(this.state.tasks);
  }

  render() {
    let taskCards = [];
    for (let task of this.state.tasks) {
      taskCards.push(
        <nav className="level">
          <KanbanTaskCard title={task.title} dueDate={task.dueDate} />
        </nav>);
    }

    return (
      <div className="kanban-column">
        <h3 className="title is-3">{this.props.title}</h3>
        <button onClick={() => this.addTask('Untitled', 'Anytime')}>+</button>
        {taskCards}
      </div>
    );
  }
}

class KanbanTaskCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.title,
      dueDate: props.dueDate,
    };
  }

  render() {
    return (
      <div className="kanban-task-card box is-fullwidth">
        <h5 className="title is-5">{this.props.title}</h5>
        <h6 className="subtitle is-6">{this.props.dueDate}</h6>
      </div>
    )
  }
}

export default KanbanBoard;
