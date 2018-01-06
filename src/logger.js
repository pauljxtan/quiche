
export const LogActions = Object.freeze({
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

