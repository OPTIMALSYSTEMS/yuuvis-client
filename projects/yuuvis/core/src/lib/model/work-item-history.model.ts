/**
 * @ignore
 */
export interface WorkItemHistoryPerformer {
  type: string;
  label: string;
}

/**
 * History entry of a work item.
 */
export class WorkItemHistoryEntry {
  /**
   * Key for default type
   */
  TYPE_DEFAULT = 'default';
  /**
   * Key for error type
   */
  TYPE_ERROR = 'error';
  /**
   * Key for custom type
   */
  TYPE_CUSTOM = 'custom';
  TYPE_DEADLINE_START = 'deadline_start';
  TYPE_DEADLINE_REACHED = 'deadline_reached';

  /**
   * Title of the history entry
   */
  title: string;
  /**
   * Short description of the history entry
   */
  description: string;
  /**
   * The date (time) this entry was created
   */
  time: Date;
  /**
   * Index of the history entry (may be used for ordering)
   */
  number: number;
  /**
   * History entries type
   */
  type: string;
  /**
   * User that was responsible for creating this entry (e.g. by executing an action)
   */
  editor: any; //OrgUser;
  /**
   * Collection of performers. Performers are users, groups or roles that received a work item that let to the creation of a history entry.
   * If for example a work item was forwarded, the history entry created for that action will contain the recipients of the forwarded action.
   */
  performer: WorkItemHistoryPerformer[];
  /**
   * Additional data for special kinds of entries like errors, personalization, periods
   */
  data: any;

  /**
   * Creates a new instance
   * @param json The JSON object received from the backend. This will be used to construct the new work item history instance
   */
  constructor(json: any) {
    this.title = json.activityName;
    this.description = json.description;
    this.number = json.number;
    this.time = json.time;
    this.type = this.TYPE_DEFAULT;
    this.data = {};

    // overrides for special types of history entries
    switch (json.type) {
      // error entry for the whole process
      case 'PROCESS_ERRORSUSPEND': {
        this.title = json.description;
        this.description = json.errorMessage;
        this.type = this.TYPE_ERROR;
        break;
      }
      // error entry for an activity
      case 'ACTIVITY_SUSPENDONERROR': {
        this.type = this.TYPE_ERROR;
        break;
      }
      // user defined history entry
      case 'USERDEFINED': {
        this.type = this.TYPE_CUSTOM;
        break;
      }
      // deadline started
      case 'DEADLINE_START': {
        this.title = `${json.periodName}: ${json.description}`;
        // description will be generated in template
        this.description = null;
        this.data = {
          periodFireTime: json.periodFireTime
        };
        this.type = this.TYPE_DEADLINE_START;
        break;
      }
      // deadline reached
      case 'DEADLINE_FIRE': {
        this.title = `${json.periodName}: ${json.description}`;
        // description will be generated in template
        this.description = null;
        this.data = {
          periodFireTime: json.periodFireTime
        };
        this.type = this.TYPE_DEADLINE_REACHED;
        break;
      }
    }

    // are there additional information about the performer
    // that caused the history entry
    if (json.performer) {
      this.performer = [];
      json.performer.groups.forEach(g =>
        this.performer.push({ type: 'group', label: g.name })
      );
      json.performer.roles.forEach(r =>
        this.performer.push({ type: 'role', label: r.name })
      );
      json.performer.users.forEach(u =>
        this.performer.push({
          type: 'user',
          label: `${u.lastname}, ${u.firstname} (${u.name})`
        })
      );
    }

    if (json.user) {
      this.editor = json.user;
    }
  }
}
