import React, {Component} from 'react';
import Dragula from 'react-dragula';
import {RIEInput, RIENumber} from 'riek';
import {instanceOf} from 'prop-types';
import {withCookies, Cookies} from 'react-cookie';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import 'react-dragula/dist/dragula.min.css';
import 'bulma-extensions/bulma-tooltip/bulma-tooltip.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'react-datepicker/dist/react-datepicker.min.css';
import './kanban.css';

/*
TODO:
-- Get the cookies actually working
-- Import/export?
-- Responsive multiple cards per level
-- Move logging logic out of board object
 */

const phases = {
  'todo': 'To-do',
  'doing': 'Doing',
  'done': 'Done'
};

const LogActions = Object.freeze({
  ADDED_TASK_TO_TODO: 0,
  ADDED_TASK_TO_DOING: 1,
  ADDED_TASK_TO_DONE: 2,
  MOVED_TASK_TO_TODO: 3,
  MOVED_TASK_TO_DOING: 4,
  MOVED_TASK_TO_DONE: 5,
  UPDATED_TASK_TITLE: 6,
  CLEARED_ALL_TASKS: 7,
});

const drake = Dragula([], {
  isContainer: function (el) {
    return el.classList.contains('kanban-task-cards');
  },
});

class KanbanBoard extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

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

  addTask(column) {
    const task = new KanbanTask('Do a thing', new Date(), ++this.taskCounter);
    this.setState({
      tasks: this.state.tasks.concat([{'phase': column, 'task': task}])
    });
    this.logAddTask(column, task);
  }

  // Wrapper for logging task additions
  logAddTask(column, task) {
    switch (column) {
      case 'todo':
        this.logAction(LogActions.ADDED_TASK_TO_TODO, {'task': task});
        break;
      case 'doing':
        this.logAction(LogActions.ADDED_TASK_TO_DOING, {'task': task});
        break;
      case 'done':
        this.logAction(LogActions.ADDED_TASK_TO_DONE, {'task': task});
        break;
      default:
        break;
    }
  }

  // Wrapper for logging task moves
  logMoveTask(task, fromCol, toCol) {
    switch (toCol) {
      case 'todo':
        this.logAction(LogActions.MOVED_TASK_TO_TODO, {'task': task, 'fromCol': fromCol});
        break;
      case 'doing':
        this.logAction(LogActions.MOVED_TASK_TO_DOING, {'task': task, 'fromCol': fromCol});
        break;
      case 'done':
        this.logAction(LogActions.MOVED_TASK_TO_DONE, {'task': task, 'fromCol': fromCol});
        break;
      default:
        break;
    }
  }

  // Wrapper for logging task title updates
  logUpdateTaskTitle(task, oldTitle, newTitle) {
    this.logAction(
      LogActions.UPDATED_TASK_TITLE,
      {'task': task, 'oldTitle': oldTitle, 'newTitle': newTitle}
    );
  }

  // Wrapper for logging task due date updates
  logUpdateTaskDate(task, oldDate, newDate) {
    this.logAction(
      LogActions.UPDATED_TASK_DUE_DATE,
      {'task': task, 'oldDate': oldDate, 'newDate': newDate}
    );
  }

  moveTask(taskId, fromPhase, toPhase) {
    const elemToReplace = this.state.tasks.find(el => el.task.id === parseInt(taskId));
    const task = elemToReplace.task;
    const newTasks = this.state.tasks.filter(el => el.task.id !== parseInt(taskId))
      .concat({phase: toPhase, task: task});
    this.setState({tasks: newTasks});
    this.logMoveTask(task, fromPhase, toPhase);
  }

  // TODO: Refactor task updates (title, due date, etc.) to common method

  updateTaskTitle(id, title) {
    const elemToReplace = this.state.tasks.find(el => el.task.id === parseInt(id));
    const oldTask = elemToReplace.task;
    const updatedTask = new KanbanTask(title, oldTask.dueDate, oldTask.id);
    const newTasks = this.state.tasks.filter(el => el.task.id !== parseInt(id))
      .concat({phase: elemToReplace.phase, task: updatedTask});
    this.setState({tasks: newTasks});
    this.logUpdateTaskTitle(updatedTask, oldTask.title, updatedTask.title);
  }

  updateTaskDate(id, date) {
    const elemToReplace = this.state.tasks.find(el => el.task.id === parseInt(id));
    const oldTask = elemToReplace.task;
    const updatedTask = new KanbanTask(oldTask.title, moment(date), oldTask.id);
    const newTasks = this.state.tasks.filter(el => el.task.id !== parseInt(id))
      .concat({phase: elemToReplace.phase, task: updatedTask});
    this.setState({tasks: newTasks});
    this.logUpdateTaskDate(updatedTask, oldTask.dueDate, updatedTask.dueDate);
  }

  clearAllTasks() {
    this.setState({tasks: []});
    this.logAction(LogActions.CLEARED_ALL_TASKS);
  }

  logItemsMaxChanged(props) {
    if (props.logItemsMax > 0) this.setState(props);
  }

  // TODO: This huge method looks ugly here, refactor this logic elsewhere
  logAction(actionType, kwargs = {}) {
    let task;
    let fromCol;
    let fromColReadable;
    if ('task' in kwargs) task = kwargs.task;
    if ('fromCol' in kwargs) {
      fromCol = kwargs.fromCol;
      fromColReadable = phases[fromCol];
    }
    let message;
    switch (actionType) {
      case LogActions.ADDED_TASK_TO_TODO:
        message = 'Added task <b>' + task.title + '</b> to <b class="colour-text-todo">To-do</b>';
        message += ' [' + (this.state.tasks.filter(el => el.phase === 'todo').length + 1) + ']';
        message += ' (due: <b>' + task.dueDate.format("MMM DD") + '</b>)';
        break;
      case LogActions.ADDED_TASK_TO_DOING:
        message = 'Added task <b>' + task.title + '</b> to <b class="colour-text-doing">Doing</b>';
        message += ' [' + (this.state.tasks.filter(el => el.phase === 'doing').length + 1) + ']';
        message += ' (due: <b>' + task.dueDate.format("MMM DD") + '</b>)';
        break;
      case LogActions.ADDED_TASK_TO_DONE:
        message = 'Added task <b>' + task.title + '</b> to <b class="colour-text-done">Done</b>';
        message += ' [' + (this.state.tasks.filter(el => el.phase === 'done').length + 1) + ']';
        message += ' (due: <b>' + task.dueDate.format("MMM DD") + '</b>)';
        break;
      case LogActions.MOVED_TASK_TO_TODO:
        message = 'Moved task <b>' + task.title + '</b> from <b class="colour-text-' + fromCol + '">' + fromColReadable + '</b>';
        message += ' to <b class="colour-text-todo">To-do</b>';
        message += ' [' + (this.state.tasks.filter(el => el.phase === 'todo').length) + ']';
        break;
      case LogActions.MOVED_TASK_TO_DOING:
        message = 'Moved task <b>' + task.title + '</b> from <b class="colour-text-' + fromCol + '">' + fromColReadable + '</b>';
        message += ' to <b class="colour-text-doing">Doing</b>';
        message += ' [' + (this.state.tasks.filter(el => el.phase === 'doing').length) + ']';
        break;
      case LogActions.MOVED_TASK_TO_DONE:
        message = 'Moved task <b>' + task.title + '</b> from <b class="colour-text-' + fromCol + '">' + fromColReadable + '</b>';
        message += ' to <b class="colour-text-done">Done</b>';
        break;
      case LogActions.UPDATED_TASK_TITLE:
        message = 'Changed title of task <b>' + kwargs.oldTitle + '</b> to <b>' + kwargs.newTitle + '</b>';
        break;
      case LogActions.UPDATED_TASK_DATE:
        message = 'Changed due date of task <b>' + task.title + '</b>';
        message += ' from <b>' + kwargs.oldDate.format('MMM DD, YYYY') + '</b>';
        message += ' to <b>' + kwargs.newDate.format('MMM DD, YYYY') + '</b>';
        break;
      case LogActions.CLEARED_ALL_TASKS:
        message = 'Cleared all tasks';
        break;
      default:
        return;
    }
    const logItem = new KanbanLogItem(actionType, message, ++this.logCounter);
    this.setState({
      logItems: [logItem].concat(this.state.logItems)
    });
  }

  renderTodoColumn() {
    return (
      <KanbanColumn title="To-do"
                    phase="todo"
                    tasks={this.state.tasks.filter(task => task.phase === 'todo').map(task => task.task)}
                    addTaskCallback={() => this.addTask('todo')}
                    titleChangedCallback={(id, title) => this.updateTaskTitle(id, title)}
                    dateChangedCallback={(id, date) => this.updateTaskDate(id, date)}
      />
    );
  }

  renderDoingColumn() {
    return (
      <KanbanColumn title="Doing"
                    phase="doing"
                    tasks={this.state.tasks.filter(task => task.phase === 'doing').map(task => task.task)}
                    addTaskCallback={() => this.addTask('doing')}
                    titleChangedCallback={(id, title) => this.updateTaskTitle(id, title)}
                    dateChangedCallback={(id, date) => this.updateTaskDate(id, date)}
      />
    );
  }

  renderDoneColumn() {
    return (
      <KanbanColumn title="Done"
                    phase="done"
                    tasks={this.state.tasks.filter(task => task.phase === 'done').map(task => task.task)}
                    addTaskCallback={() => this.addTask('done')}
                    titleChangedCallback={(id, title) => this.updateTaskTitle(id, title)}
                    dateChangedCallback={(id, date) => this.updateTaskDate(id, date)}
      />
    );
  }

  renderLog() {
    return (
      <KanbanLog items={this.state.logItems} maxItems={this.state.logItemsMax}/>
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
              {this.renderLog()}
            </div>
            <div className="kanban-stats-container column">
              TBA
            </div>
          </div>
        </section>
      </div>
    );
  }

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

const KanbanColumn = function (props) {
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
            <KanbanTaskCard task={task}
              // title={task.title} dueDate={task.dueDate}
                            titleChangedCallback={(title) => props.titleChangedCallback(task.id, title)}
                            dateChangedCallback={(date) => props.dateChangedCallback(task.id, date)}
            />
          </nav>
        )}
      </div>
    </div>
  );
};

class KanbanTaskCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.task.title,
      dueDate: props.task.dueDate,
      // TODO: Probably will just remove the description entirely
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      dateCreated: props.task.dateCreated
    };
    this.id = props.id;
    // These binds ensure that "this" references the correct object (in this case, the KanbanTaskCard)
    this.titleChanged = this.titleChanged.bind(this);
    this.descriptionChanged = this.descriptionChanged.bind(this);
    this.dateChanged = this.dateChanged.bind(this);
    // Callbacks for updating task attributes
    this.titleChangedCallback = props.titleChangedCallback;
    this.dateChangedCallback = props.dateChangedCallback;
  }

  titleChanged(props) {
    if (props.title !== "") this.setState(props);
    this.titleChangedCallback(props.title);
  }

  descriptionChanged(props) {
    if (props.description !== "") this.setState(props);
  }

  dateChanged(date) {
    this.setState({dueDate: date});
    this.dateChangedCallback(date);
  }

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
                <a className="button is-small has-text-danger">
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


const KanbanLog = function (props) {
  return (
    <table className="kanban-log table is-narrow is-hoverable is-bordered">
      <thead>
      <tr>
        <th>Time</th>
        <th>Event</th>
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

class KanbanTask {
  constructor(title, dueDate, id) {
    this.title = title;
    this.dueDate = moment(dueDate);
    this.dateCreated = moment(new Date());
    this.id = id;
  }

  toString() {
    return "[KanbanTask_" + this.id + "]";
  }
}

class KanbanLogItem {
  constructor(actionType, message, id) {
    this.actionType = actionType;
    this.message = message;
    this.id = id;
    this.timestamp = new Date().toLocaleString();
  }

  toString() {
    return "[KanbanLogItem_" + this.id + "]";
  }
}

const getIdFromDomId = (domId) => domId.split('-').slice(-1)[0];

export default withCookies(KanbanBoard);
