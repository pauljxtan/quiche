import React, {Component} from 'react';
import Dragula from 'react-dragula';
import {RIEInput, RIETextArea} from 'riek';
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
-- Responsive multiple cards per level
 */

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
    this.taskCounter = 0;
    this.logCounter = 0;
    this.state = {
      tasks: cookies.get('tasks') || [],
      logItems: []
    };
  }

  addTask(column) {
    const task = new KanbanTask('Untitled', new Date(), ++this.taskCounter);
    this.setState({
      tasks: this.state.tasks.concat([{'phase': column, 'task': task}])
    });
    this.logAddTask(column, task);
  }

  // Helper function for logging task additions
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

  moveTask(taskId, fromCol, toCol) {
    // task = this.state.tasks[fromCol].find(task => task.id === taskId);
    // const newFromCol = this.state.tasks[fromCol].filter(task => task.id !== taskId);
    // const newToCol = this.state.tasks[toCol].concat([task]);
    // this.setState({
    //   tasks: {
    // })
  }

  clearAllTasks() {
    this.setState({tasks: []});
    this.logAction(LogActions.CLEARED_ALL_TASKS);
  }

  logAction(actionType, kwargs = {}) {
    let task;
    if (kwargs) task = kwargs['task'];
    let message;
    switch (actionType) {
      case LogActions.ADDED_TASK_TO_TODO:
        message = 'Added task <b>' + task['title'] + '</b> to <b class="colour-text-todo">To-do</b>'
        message += ' (due: <b>' + task['dueDate'].format("MMM DD, YYYY") + '</b>)';
        break;
      case LogActions.ADDED_TASK_TO_DOING:
        message = 'Added task <b>' + task['title'] + '</b> to <b class="colour-text-doing">Doing</b>';
        message += ' (due: <b>' + task['dueDate'].format("MMM DD, YYYY") + '</b>)';
        break;
      case LogActions.ADDED_TASK_TO_DONE:
        message = 'Added task <b>' + task['title'] + '</b> to <b class="colour-text-done">Done</b>';
        message += ' (due: <b>' + task['dueDate'].format("MMM DD, YYYY") + '</b>)';
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
      />
    );
  }

  renderDoingColumn() {
    return (
      <KanbanColumn title="Doing"
                    phase="doing"
                    tasks={this.state.tasks.filter(task => task.phase === 'doing').map(task => task.task)}
                    addTaskCallback={() => this.addTask('doing')}
      />
    );
  }

  renderDoneColumn() {
    return (
      <KanbanColumn title="Done"
                    phase="done"
                    tasks={this.state.tasks.filter(task => task.phase === 'done').map(task => task.task)}
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
              {this.renderLog()}
            </div>
            <div className="kanban-stats-container column">
              <a className="button" onClick={() => this.clearAllTasks()}>Clear all tasks</a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  dragulaDecorator() {
    Dragula([], {
      isContainer: function (el) {
        return el.classList.contains('kanban-task-cards');
      },
    })
      .on('drop', function (el, target, source) {
        // Move task from source column to target column
        // Container IDs are 'kanban-task-cards-doing', etc.
        this.moveTask(el.id, target.id.split('-').slice(-1)[0], source.id.split('-').slice(-1)[0]);
      });
  }
}

const KanbanColumn = function (props) {
  return (
    <div className="kanban-column column">
      <h3 className="kanban-column-title title is-3">
        {props.title}
      </h3>
      &nbsp;&nbsp;
      <a className="kanban-task-counter button is-static is-small">{props.tasks.length}</a>
      <button className="kanban-add-task button" onClick={() => props.addTaskCallback()}>+</button>
      <div className="kanban-task-cards" id={"kanban-task-cards-" + props.phase}>
        {props.tasks.map(task =>
          <nav className="level" key={task}>
            <KanbanTaskCard title={task.title} dueDate={task.dueDate} id={task.id}/>
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
      title: props.title,
      // dueDate: props.dueDate,
      dueDate: moment(),
      // TODO: placeholder for now
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      timeCreated: new Date(),
    };
    this.titleChanged = this.titleChanged.bind(this);
    this.descriptionChanged = this.descriptionChanged.bind(this);
    this.dateChanged = this.dateChanged.bind(this);
  }

  titleChanged(props) {
    if (props.title !== "") this.setState(props);
  }

  descriptionChanged(props) {
    if (props.description !== "") this.setState(props);
  }

  dateChanged(date) {
    this.setState({dueDate: date});
  }

  render() {
    return (
      <div className="kanban-task-card card is-fullwidth tooltip is-tooltip-info"
           id={"kanban-task-card-" + this.props.id} data-tooltip="Drag me!">
        <div className="card-header">
          <div className="card-header-title title is-5">
            <RIEInput className="kanban-task-title"
                      classEditing="kanban-task-title-editing input"
                      value={this.state.title}
                      change={this.titleChanged}
                      propName="title"/>
          </div>
        </div>
        <div className="card-content">
          <div className="content">
            <RIETextArea className="kanban-task-description"
                         classEditing="kanban-task-description-editing textarea"
                         value={this.state.description}
                         change={this.descriptionChanged}
                         propName="description"/>

            <div className="kanban-task-duedate field has-addons">
              <p className="control">
                <a className="button is-static">Due on</a>
              </p>
              <div className="control">
                <DatePicker className="kanban-task-datepicker input"
                            selected={this.state.dueDate}
                            onChange={this.dateChanged}
                            dateFormat="MMM DD, YYYY"/>
              </div>
            </div>
          </div>
        </div>
        {/*<footer className="card-footer">*/}
        {/*<a href="#" className="card-footer-item has-text-primary">*/}
        {/*<span className="icon">*/}
        {/*<i className="fa fa-edit">&nbsp;</i>*/}
        {/*</span>*/}
        {/*Edit*/}
        {/*</a>*/}
        {/*<a href="#" className="card-footer-item has-text-danger">*/}
        {/*<span className="icon">*/}
        {/*<i className="fa fa-trash">&nbsp;</i>*/}
        {/*</span>*/}
        {/*Delete*/}
        {/*</a>*/}
        {/*</footer>*/}
      </div>
    )
  }
}


const KanbanLog = function (props) {
  return (
    <table className="kanban-log table is-narrow is-hoverable">
      <tbody>
      {props.items.map(item =>
        <tr key={item}>
          <th>{item.timestamp}</th>
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

export default withCookies(KanbanBoard);
