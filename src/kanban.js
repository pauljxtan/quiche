import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import dragula from 'react-dragula';
import { RIEInput } from 'riek';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

import 'react-dragula/dist/dragula.min.css';
import './kanban.css';

/*
TODO:
-- Refactor simple components to functional definition
 */

const drake = dragula({/*TODO*/});

class KanbanBoard extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    const { cookies } = this.props;
    this.state = {
      tasks: cookies.get('tasks') || {'todo': [], 'doing': [], 'done': []}
    };
  }

  addTask(column) {
    const task = {
      title: 'Untitled',
      dueDate: 'Anytime'
    };
    const prevTodo = this.state.tasks['todo'];
    const prevDoing = this.state.tasks['doing'];
    const prevDone = this.state.tasks['done'];

    switch (column) {
      case 'todo':
        this.setState({
          tasks: {'todo': prevTodo.concat([task]), 'doing': prevDoing, 'done': prevDone}
        });
        break;
      case 'doing':
        this.setState({
          tasks: {'todo': prevTodo , 'doing': prevDoing.concat([task]), 'done': prevDone}
        });
        break;
      case 'done':
        this.setState({
          tasks: {'todo': prevTodo , 'doing': prevDoing, 'done': prevDone.concat([task])}
        });
        break;
      default:
        break;
    }
    console.log(this.state.tasks);
  }

  renderTodoColumn() {
    return (
      <KanbanColumn title="To-do"
                    tasks={this.state.tasks['todo']}
                    addTaskCallback={() => this.addTask('todo')}
      />
    );
  }

  renderDoingColumn() {
    return (
      <KanbanColumn title="Doing"
                    tasks={this.state.tasks['doing']}
                    addTaskCallback={() => this.addTask('doing')}
      />
    );
  }

  renderDoneColumn() {
    return (
      <KanbanColumn title="Done"
                    tasks={this.state.tasks['done']}
                    addTaskCallback={() => this.addTask('done')}
      />
    );
  }

  render() {
    return (
      <div className="kanban-board">
        <div className="columns">
          <div className="kanban-column-todo column is-third">
            {this.renderTodoColumn()}
          </div>
          <div className="kanban-column-doing column is-third">
            {this.renderDoingColumn()}
          </div>
          <div className="kanban-column-done column is-third">
            {this.renderDoneColumn()}
          </div>
        </div>
      </div>
    );
  }
}

class KanbanColumn extends Component {
  render() {
    const taskCards = [];
    for (let task of this.props.tasks) {
      taskCards.push(
        <nav className="level" key={task}>
          <KanbanTaskCard title={task.title} dueDate={task.dueDate} />
        </nav>);
    }

    return (
      <div className="kanban-column column">
        <h3 className="kanban-column-title title is-3">{this.props.title}</h3>
        <button className="kanban-add-task button" onClick={() => this.props.addTaskCallback()}>+</button>
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

export default withCookies(KanbanBoard);
