import React, {Component} from 'react';
import Dragula from 'react-dragula';
import {RIEInput, RIENumber} from 'riek';
import DatePicker from 'react-datepicker';
import moment from 'moment';
// import fileDownload from 'js-file-download';

import 'react-dragula/dist/dragula.min.css';
import 'bulma-extensions/bulma-tooltip/bulma-tooltip.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'react-datepicker/dist/react-datepicker.min.css';
import './kanban.css';

/*
TODO:
-- Figure out a good separation between board and logging logic
-- Implement command pattern to allow undo/redo, etc.
-- Import/export?
-- Responsive multiple cards per level
-- Progress bar?
-- Add category tags, priority, etc.
-- Add display for due soon / overdue / etc.
-- Cleanup package.json
*/

// Drag-and-drop handler
const drake = Dragula([], {
  isContainer: function (el) {
    return el.classList.contains('kanban-task-cards');
  },
});

/**** React Components ****/

class Board extends Component {
  constructor(props) {
    super(props);
    const {cookies} = this.props;
    this.taskCounter = 0;
    this.logCounter = 0;
    this.state = {
      tasks: cookies.get('tasks') || [],
      logItems: [],
      logItemsMax: 5
    };
    this.clearAllTasks = this.clearAllTasks.bind(this);
    this.logItemsMaxChanged = this.logItemsMaxChanged.bind(this);
  }

  /**** Task actions ****/

  addTask(column) {
    const task = new Task('Do a thing', new Date(), ++this.taskCounter);
    this.setState({
      tasks: this.state.tasks.concat([{'phase': column, 'task': task}])
    });
    this.logAction(
      LogActions.ADDED_TASK,
      {'task': task, 'toCol': column}
    );
  }

  moveTask(taskId, fromPhase, toPhase) {
    const elemToReplace = this.state.tasks.find(el => el.task.id === parseInt(taskId));
    const task = elemToReplace.task;
    const newTasks = this.state.tasks.filter(el => el.task.id !== parseInt(taskId))
      .concat({phase: toPhase, task: task});
    this.setState({tasks: newTasks});
    this.logAction(
      LogActions.MOVED_TASK,
      {'task': task, 'toCol': toPhase, 'fromCol': fromPhase}
    );
  }

  deleteTask(taskId) {
    const taskToDelete = this.state.tasks.find(el => el.task.id === parseInt(taskId)).task;
    const newTasks = this.state.tasks.filter(el => el.task.id !== parseInt(taskId));
    this.setState({tasks: newTasks});
    this.logAction(
      LogActions.DELETED_TASK,
      {'task': taskToDelete}
    );
  }

  // TODO: Refactor common task update logic

  updateTaskTitle(id, title) {
    const elemToReplace = this.state.tasks.find(el => el.task.id === parseInt(id));
    const oldTask = elemToReplace.task;
    const updatedTask = new Task(title, oldTask.dueDate, oldTask.id);
    const newTasks = this.state.tasks.filter(el => el.task.id !== parseInt(id))
      .concat({phase: elemToReplace.phase, task: updatedTask});
    this.setState({tasks: newTasks});
    this.logAction(
      LogActions.UPDATED_TASK_TITLE,
      {'task': updatedTask, 'oldTitle': oldTask.title, 'newTitle': updatedTask.title}
    );
  }

  updateTaskDate(id, date) {
    const elemToReplace = this.state.tasks.find(el => el.task.id === parseInt(id));
    const oldTask = elemToReplace.task;
    const updatedTask = new Task(oldTask.title, moment(date), oldTask.id);
    const newTasks = this.state.tasks.filter(el => el.task.id !== parseInt(id))
      .concat({phase: elemToReplace.phase, task: updatedTask});
    this.setState({tasks: newTasks});
    this.logAction(
      LogActions.UPDATED_TASK_DATE,
      {'task': updatedTask, 'oldDate': oldTask.dueDate, 'newDate': updatedTask.dueDate}
    );
  }

  clearAllTasks() {
    this.setState({tasks: []});
    this.logAction(LogActions.CLEARED_ALL_TASKS);
  }

  /**** Logbook actions ****/

  logItemsMaxChanged(props) {
    if (props.logItemsMax > 0) this.setState(props);
  }

  logAction(actionType, kwargs = {}) {
    kwargs['tasks'] = this.state.tasks;
    const logItem = Logger.getLogItem(actionType, ++this.logCounter, kwargs);
    this.setState({
      logItems: [logItem].concat(this.state.logItems)
    });
  }

  /**** Rendering ***/

  // TODO: A lot of repeated code here...

  renderTodoColumn() {
    return (
      <Column title="To-do"
                    phase="todo"
                    tasks={this.state.tasks.filter(task => task.phase === 'todo').map(task => task.task)}
                    addTaskCallback={() => this.addTask('todo')}
                    titleChangedCallback={(id, title) => this.updateTaskTitle(id, title)}
                    dateChangedCallback={(id, date) => this.updateTaskDate(id, date)}
                    deleteCallback={(id) => this.deleteTask(id)}
      />
    );
  }

  renderDoingColumn() {
    return (
      <Column title="Doing"
                    phase="doing"
                    tasks={this.state.tasks.filter(task => task.phase === 'doing').map(task => task.task)}
                    addTaskCallback={() => this.addTask('doing')}
                    titleChangedCallback={(id, title) => this.updateTaskTitle(id, title)}
                    dateChangedCallback={(id, date) => this.updateTaskDate(id, date)}
                    deleteCallback={(id) => this.deleteTask(id)}
      />
    );
  }

  renderDoneColumn() {
    return (
      <Column title="Done"
                    phase="done"
                    tasks={this.state.tasks.filter(task => task.phase === 'done').map(task => task.task)}
                    addTaskCallback={() => this.addTask('done')}
                    titleChangedCallback={(id, title) => this.updateTaskTitle(id, title)}
                    dateChangedCallback={(id, date) => this.updateTaskDate(id, date)}
                    deleteCallback={(id) => this.deleteTask(id)}
      />
    );
  }

  renderLogBook() {
    return (
      <LogBook items={this.state.logItems} maxItems={this.state.logItemsMax}/>
    )
  }

  render() {
    return (
      <div className="kanban-board container">
        <section className="kanban-title hero section">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">
                A Kanban board
              </h1>
              <h2 className="subtitle">
                <i className="fa fa-info-circle">&nbsp;</i>
                Drag and drop tasks between columns.
                Click on a title, description or due date to edit.
              </h2>
            </div>
          </div>
        </section>
        <section className="kanban-columns section" ref={this.dragulaDecorator}>
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
        </section>
        <section className="kanban-meta section">
          <div className="columns">
            <div className="kanban-log-container column is-two-thirds">
              <div className="columns">
                <div className="column is-two-thirds">
                  <p>Showing the &nbsp;
                    <RIENumber className="kanban-log-max input is-small"
                               value={this.state.logItemsMax}
                               change={this.logItemsMaxChanged}
                               propName="logItemsMax"/>
                    &nbsp; most recent log entries</p>
                </div>
                <div className="column">
                  <a className="button is-outlined is-danger" onClick={this.clearAllTasks}>Clear all tasks</a>
                </div>
              </div>
              {this.renderLogBook()}
            </div>
            <div className="kanban-stats-container column">
              TBA
            </div>
          </div>
        </section>
      </div>
    );
  }

  /**** Lifecycle ****/

  componentDidMount() {
    // Handle the drop event: task is moved to a different column
    drake.on('drop', function (el, target, source) {
      if (target === source) return;
      // NOTE: The drop action must be reverted here due to the issue described here:
      //       https://github.com/bevacqua/react-dragula/issues/23
      // Basically, Dragula changes the DOM in a way that is not picked up in the virtual DOM
      // used by React; so we revert Dragula's DOM change and allow React to render the same
      // change from its own state (which we modify manually).
      drake.cancel(true);
      // NOTE: The identifiers for the tasks and columns are pulled out of their respective DOM IDs
      // -- Task card (level) IDs: 'kanban-task-card-42', etc.
      // -- Container IDs: 'kanban-task-cards-doing', etc.
      const taskId = getIdFromDomId(el.id);
      const fromCol = getIdFromDomId(source.id);
      const toCol = getIdFromDomId(target.id);
      this.moveTask(taskId, fromCol, toCol);
    }.bind(this));
  }
}

const Column = function (props) {
  return (
    <div className="kanban-column column">
      <h3 className="kanban-column-title title is-3">
        {props.title}
      </h3>
      &nbsp;&nbsp;
      <a className="kanban-task-counter button is-static">{props.tasks.length}</a>
      <button className="kanban-add-task button" onClick={() => props.addTaskCallback()}>+</button>
      <div className="kanban-task-cards" id={"kanban-task-cards-" + props.phase}>
        {props.tasks.map(task =>
          <nav className="level" id={"kanban-task-card-" + task.id} key={task}>
            <TaskCard task={task}
              // title={task.title} dueDate={task.dueDate}
                            titleChangedCallback={(title) => props.titleChangedCallback(task.id, title)}
                            dateChangedCallback={(date) => props.dateChangedCallback(task.id, date)}
                            deleteCallback={() => props.deleteCallback(task.id)}
            />
          </nav>
        )}
      </div>
    </div>
  );
};

class TaskCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.task.title,
      dueDate: props.task.dueDate,
      dateCreated: props.task.dateCreated
    };
    this.id = props.id;
    // These binds ensure that "this" references the correct object (in this case, the TaskCard)
    this.titleChanged = this.titleChanged.bind(this);
    this.dateChanged = this.dateChanged.bind(this);
    // Callbacks for updating task attributes
    this.titleChangedCallback = props.titleChangedCallback;
    this.dateChangedCallback = props.dateChangedCallback;
    this.deleteCallback = props.deleteCallback;
  }

  /**** Event handlers ****/

  titleChanged(props) {
    if (props.title !== "") this.setState(props);
    this.titleChangedCallback(props.title);
  }

  dateChanged(date) {
    this.setState({dueDate: date});
    this.dateChangedCallback(date);
  }

  /**** Rendering ****/

  render() {
    return (
      <div className="kanban-task-card card is-fullwidth tooltip is-tooltip-info"
           data-tooltip="Drag me!">
        <div className="card-content">
          <div className="content">
            <RIEInput className="kanban-task-title has-text-weight-bold"
                      classEditing="kanban-task-title-editing input has-text-weight-normal"
                      value={this.state.title}
                      change={this.titleChanged}
                      defaultProps={{style: {float: "left"}}}
                      propName="title"/>
            <div className="clear-float"></div>
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <div className="kanban-task-duedate field has-addons">
                    <p className="control">
                      <a className="button is-static is-small">Due on</a>
                    </p>
                    <div className="control">
                      <DatePicker className="kanban-task-datepicker input is-small"
                                  selected={this.state.dueDate}
                                  onChange={this.dateChanged}
                                  dateFormat="MMM DD, YYYY"/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="level-right">
                <a className="button is-small has-text-danger" onClick={this.deleteCallback}>
                  <span className="icon">
                  <i className="fa fa-trash"></i>
                  </span>
                  &nbsp;&nbsp;Delete
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const LogBook = function (props) {
  return (
    <table className="kanban-log table is-narrow is-hoverable is-bordered">
      <thead>
      <tr>
        <th>Time</th>
        <th>Action</th>
      </tr>
      </thead>
      <tbody>
      {props.items.slice(0, props.maxItems).map(item =>
        <tr key={item}>
          <td>{item.timestamp}</td>
          <td dangerouslySetInnerHTML={{__html: item.message}}/>
        </tr>
      )}
      </tbody>
    </table>
  );
};

/**** Command classes ****/

// TODO

/**** Data classes ****/

class Task {
  constructor(title, dueDate, id) {
    this.title = title;
    this.dueDate = moment(dueDate);
    this.dateCreated = moment(new Date());
    this.id = id;
  }

  toString() {
    return "[Task_" + this.id + "]";
  }
}

/**** Logging ****/

const LogActions = Object.freeze({
  ADDED_TASK: 0,
  MOVED_TASK: 1,
  DELETED_TASK: 2,
  UPDATED_TASK_TITLE: 3,
  UPDATED_TASK_DATE: 4,
  CLEARED_ALL_TASKS: 5,
});

const phases = {
  'todo': 'To-do',
  'doing': 'Doing',
  'done': 'Done'
};

export class Logger {
  static getLogItem(actionType, id, kwargs) {
    let message;
    switch (actionType) {
      case LogActions.ADDED_TASK:
        message = `Added <b>${kwargs.task.title}</b> `;
        message += ` to <b class="colour-text-${kwargs.toCol}">${phases[kwargs.toCol]}</b>`;
        message += ` (due: <b>${kwargs.task.dueDate.format("MMM DD")}</b>)`;
        break;
      case LogActions.MOVED_TASK:
        message = `Moved <b>${kwargs.task.title}</b>`;
        message += ` from <b class="colour-text-${kwargs.fromCol}">${phases[kwargs.fromCol]}</b>`;
        message += ` from <b class="colour-text-${kwargs.toCol}">${phases[kwargs.toCol]}</b>`;
        break;
      case LogActions.DELETED_TASK:
        message = `Deleted <b>${kwargs.task.title}</b>`;
        break;
      case LogActions.UPDATED_TASK_TITLE:
        message = `Changed title of <b>${kwargs.oldTitle}</b> to <b>${kwargs.newTitle}</b>`;
        break;
      case LogActions.UPDATED_TASK_DATE:
        message = `Changed due date of <b>${kwargs.task.title}</b>`;
        message += ` from <b>${kwargs.oldDate.format('MMM DD')}</b>`;
        message += ` to <b>${kwargs.newDate.format('MMM DD')}</b>`;
        break;
      case LogActions.CLEARED_ALL_TASKS:
        message = 'Cleared all tasks';
        break;
      default:
        throw "Invalid log action type";
    }
    return new LogItem(actionType, message, id)
  }
}

class LogItem {
  constructor(actionType, message, id) {
    this.actionType = actionType;
    this.message = message;
    this.id = id;
    this.timestamp = new Date().toLocaleString();
  }

  toString() {
    return "[LogItem_" + this.id + "]";
  }
}

/**** Helper functions ****/

const getIdFromDomId = (domId) => domId.split('-').slice(-1)[0];

