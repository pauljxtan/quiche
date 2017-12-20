import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import dragula from 'react-dragula';
import {RIEInput} from 'riek';
import {instanceOf} from 'prop-types';
import {withCookies, Cookies} from 'react-cookie';
// import 'bulma-extensions/bulma-calendar/datepicker';
// import DatePicker from './datepicker_custom';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import 'react-dragula/dist/dragula.min.css';
import 'bulma-extensions/bulma-tooltip/bulma-tooltip.min.css';
import 'bulma-extensions/bulma-calendar/bulma-calendar.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'react-datepicker/dist/react-datepicker.min.css';
import './kanban.css';

/*
TODO:
-- Fix the "same key" issue
-- Get the cookies actually working
 */

const drake = dragula(
  {} // TODO: Log task moves, update board state, etc.
);

const LogActions = Object.freeze({
  ADDED_TASK_TO_TODO: 0,
  ADDED_TASK_TO_DOING: 1,
  ADDED_TASK_TO_DONE: 2,
  MOVED_TASK_TO_TODO: 3,
  MOVED_TASK_TO_DOING: 4,
  MOVED_TASK_TO_DONE: 5,
  CLEARED_ALL_TASKS: 6,
});

class KanbanBoard extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    const {cookies} = this.props;
    this.state = {
      tasks: cookies.get('tasks') || {'todo': [], 'doing': [], 'done': []},
      logItems: []
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
        this.logAction(LogActions.ADDED_TASK_TO_TODO, {'task': task});
        break;
      case 'doing':
        this.setState({
          tasks: {'todo': prevTodo, 'doing': prevDoing.concat([task]), 'done': prevDone}
        });
        this.logAction(LogActions.ADDED_TASK_TO_DOING, {'task': task});
        break;
      case 'done':
        this.setState({
          tasks: {'todo': prevTodo, 'doing': prevDoing, 'done': prevDone.concat([task])}
        });
        this.logAction(LogActions.ADDED_TASK_TO_DONE, {'task': task});
        break;
      default:
        break;
    }
  }

  clearAllTasks() {
    this.setState({
      tasks: {'todo': [], 'doing': [], 'done': []}
    });
    this.logAction(LogActions.CLEARED_ALL_TASKS);
  }

  logAction(actionType, kwargs = {}) {
    let task;
    if (kwargs) task = kwargs['task'];
    let message;
    switch (actionType) {
      case LogActions.ADDED_TASK_TO_TODO:
        // TODO: format message (colours, etc.)
        message = 'Added task <b>' + task['title'] + '</b> to <b class="colour-text-todo">To-do</b>';
        break;
      case LogActions.ADDED_TASK_TO_DOING:
        message = 'Added task <b>' + task['title'] + '</b> to <b class="colour-text-doing">Doing</b>';
        break;
      case LogActions.ADDED_TASK_TO_DONE:
        message = 'Added task <b>' + task['title'] + '</b> to <b class="colour-text-done">Done</b>';
        break;
      case LogActions.MOVED_TASK_TO_TODO:
        // TODO
        break;
      case LogActions.MOVED_TASK_TO_DOING:
        // TODO
        break;
      case LogActions.MOVED_TASK_TO_DONE:
        // TODO
        break;
      case LogActions.CLEARED_ALL_TASKS:
        message = 'Cleared all tasks';
        break;
      default:
        return;
    }
    const logItem = new KanbanLogItem(actionType, message);
    this.setState({
      logItems: [logItem].concat(this.state.logItems)
    });
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

  renderLog() {
    return (
      <KanbanLog items={this.state.logItems}/>
    )
  }

  render() {
    return (
      <div className="kanban-board container">
        <div className="columns">
          <div className="kanban-column-todo column is-third">
            {this.renderTodoColumn()}
          </div>
          <div className="kanban-column-doing column is-third">
            {this.renderDoingColumn()}
          </div>
          <div className="kanban-column-done column">
            {this.renderDoneColumn()}
          </div>
        </div>
        <div className="columns">
          <div className="kanban-log-container column is-two-thirds">
            {this.renderLog()}
          </div>
          <div className="kanban-stats-container column">
            <a className="button" onClick={() => this.clearAllTasks()}>Clear all tasks</a>
          </div>
        </div>
      </div>
    );
  }
}

class KanbanColumn extends Component {
  render() {
    return (
      <div className="kanban-column column">
        <h3 className="kanban-column-title title is-3">{this.props.title}</h3>
        <button className="kanban-add-task button" onClick={() => this.props.addTaskCallback()}>+</button>
        <div className="kanban-task-cards" ref="cardContainer">
          {this.props.tasks.map(task =>
            <nav className="level" key={task}>
              <KanbanTaskCard title={task.title} dueDate={task.dueDate}/>
            </nav>
          )}
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
      // dueDate: props.dueDate,
      dueDate: moment()
    };
    this.titleChanged = this.titleChanged.bind(this);
    this.dateChanged = this.dateChanged.bind(this);
  }

  titleChanged(props) {
    if (props.title !== "") this.setState(props);
  }

  dateChanged(date) {
    this.setState({dueDate: date});
  }

  render() {
    return (
      <div className="kanban-task-card box is-fullwidth tooltip is-tooltip-info"
           data-tooltip="Drag me!">
        <h5 className="title is-5">
          <RIEInput className="kanban-task-title title is-5"
                    classEditing="input is-small has-text-centered"
                    value={this.state.title}
                    change={this.titleChanged}
                    propName="title"/>
          {/*&nbsp;*/}
          {/*<span className="icon">*/}
          {/*<i className="fa fa-pencil"></i>*/}
          {/*</span>*/}
        </h5>
        <h6 className="kanban-task-card-due-date subtitle is-6">
          <label>Due:</label> <DatePicker className="kanban-task-datepicker input is-small"
                                          selected={this.state.dueDate}
                                          onChange={this.dateChanged.bind(this)}
        dateFormat="YYYY-MM-DD"/>
        </h6>
      </div>
    )
  }
}

const KanbanLog = function (props) {
  return (
    <table className="kanban-log table is-narrow is-hoverable">
      <tbody>
      {props.items.map(item =>
        <tr>
          <th>{item.timestamp}</th>
          <td dangerouslySetInnerHTML={{__html: item.message}}/>
        </tr>
      )}
      </tbody>
    </table>
  );
};

class KanbanLogItem {
  constructor(actionType, message, timestamp = new Date().toLocaleString()) {
    this.actionType = actionType;
    this.message = message;
    this.timestamp = timestamp;
  }
}

export default withCookies(KanbanBoard);
