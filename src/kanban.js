import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import dragula from 'react-dragula';
import { RIEInput } from 'riek';
import 'react-dragula/dist/dragula.min.css';
import './kanban.css';

/*
TODO:
-- Refactor simple components to functional definition
 */

let drake = dragula({/*TODO*/});

class KanbanBoard extends Component {
  render() {
    return (
      <div className="kanban-board">
        <div className="columns">
          <KanbanColumnTodo ref="colTodo" />
          <KanbanColumnDoing ref="colDoing" />
          <KanbanColumnDone ref="colDone" />
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
  }

  render() {
    let taskCards = [];
    for (let task of this.state.tasks) {
      taskCards.push(
        <nav className="level" key={task}>
          <KanbanTaskCard title={task.title} dueDate={task.dueDate} />
        </nav>);
    }

    return (
      <div className="kanban-column">
        <h3 className="kanban-column-title title is-3">{this.props.title}</h3>
        <button className="kanban-add-task button" onClick={() => this.addTask('Untitled', 'Anytime')}>+</button>
        <div className="kanban-task-cards" ref="cardContainer">
          {taskCards}
        </div>
      </div>
    );
  }

  componentDidMount() {
    drake.containers.push(ReactDOM.findDOMNode(this.refs.cardContainer));
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

  update(prop) {
    this.setState(prop);
  }

  render() {
    return (
      <div className="kanban-task-card box is-fullwidth">
        <h5 className="title is-5">
          <RIEInput className="title is-5"
                    value={this.state.title}
                    change={this.update.bind(this)}
                    propName="title"/>
        </h5>
        <h6 className="subtitle is-6">{this.props.dueDate}</h6>

      </div>
    )
  }
}

export default KanbanBoard;
