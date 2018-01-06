
export const LogActions = Object.freeze({
  ADDED_TASK_TO_TODO: 0,
  ADDED_TASK_TO_DOING: 1,
  ADDED_TASK_TO_DONE: 2,
  MOVED_TASK_TO_TODO: 3,
  MOVED_TASK_TO_DOING: 4,
  MOVED_TASK_TO_DONE: 5,
  UPDATED_TASK_TITLE: 6,
  CLEARED_ALL_TASKS: 7,
});

const phases = {
  'todo': 'To-do',
  'doing': 'Doing',
  'done': 'Done'
};

// TODO: The logger still has a lot of dependencies on the Kanban board - how to better separate concerns?
//       Maybe messages should still be constructed in the board class?
export class Logger {
  static getLogItem(actionType, id, kwargs) {
    let task;
    let tasks;
    let fromCol;
    let fromColReadable;
    if ('task' in kwargs) task = kwargs.task;
    if ('tasks' in kwargs) tasks = kwargs.tasks;
    if ('fromCol' in kwargs) {
      fromCol = kwargs.fromCol;
      fromColReadable = phases[fromCol];
    }
    let message;
    switch (actionType) {
      case LogActions.ADDED_TASK_TO_TODO:
        message = 'Added task <b>' + task.title + '</b> to <b class="colour-text-todo">To-do</b>';
        message += ' [' + (tasks.filter(el => el.phase === 'todo').length + 1) + ']';
        message += ' (due: <b>' + task.dueDate.format("MMM DD") + '</b>)';
        break;
      case LogActions.ADDED_TASK_TO_DOING:
        message = 'Added task <b>' + task.title + '</b> to <b class="colour-text-doing">Doing</b>';
        message += ' [' + (tasks.filter(el => el.phase === 'doing').length + 1) + ']';
        message += ' (due: <b>' + task.dueDate.format("MMM DD") + '</b>)';
        break;
      case LogActions.ADDED_TASK_TO_DONE:
        message = 'Added task <b>' + task.title + '</b> to <b class="colour-text-done">Done</b>';
        message += ' [' + (tasks.filter(el => el.phase === 'done').length + 1) + ']';
        message += ' (due: <b>' + task.dueDate.format("MMM DD") + '</b>)';
        break;
      case LogActions.MOVED_TASK_TO_TODO:
        message = 'Moved task <b>' + task.title + '</b> from <b class="colour-text-' + fromCol + '">' + fromColReadable + '</b>';
        message += ' to <b class="colour-text-todo">To-do</b>';
        message += ' [' + (tasks.filter(el => el.phase === 'todo').length) + ']';
        break;
      case LogActions.MOVED_TASK_TO_DOING:
        message = 'Moved task <b>' + task.title + '</b> from <b class="colour-text-' + fromCol + '">' + fromColReadable + '</b>';
        message += ' to <b class="colour-text-doing">Doing</b>';
        message += ' [' + (tasks.filter(el => el.phase === 'doing').length) + ']';
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

