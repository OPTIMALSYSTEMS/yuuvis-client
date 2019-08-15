/**
 * Representation of a history entry for a dms object
 */
export class DmsObjectHistoryEntry {
  /**
   * Version of the dms object at the time the history entry was created
   */
  version: number;
  /**
   * The time the history entry was created
   */
  time: Date;
  /**
   * Entry's title
   */
  title: string;
  /**
   * Entry's description
   */
  description: string;
  /**
   * Custom comment applied to the entry
   */
  comment: string;
  /**
   * Group of the entry
   */
  group: 'PROCESS' | 'MODIFICATION' | 'INFORMATIONAL';
  /**
   * History entry's type
   */
  type: string;
  /**
   * Additional parameters for special (BPM related) types of entries
   */
  parameter?: {
    processId: string;
    processName: string;
    activityId?: string;
    activityName?: string;
    type: string;
  };
  /**
   * If the history entry was created from a users activity (e.g. indexdata changes), this property
   * holds the user that caused the entry
   */
  user: any; // OrgUser;

  /**
   * Creates a new instance
   * @param json The JSON object received from the backend. This will be used to construct the new history entry instance
   */
  constructor(json: any) {
    this.version = json.version;
    this.time = json.time;
    this.title = json.title;
    this.description = json.description;
    this.comment = json.comment;
    this.group = json.group;
    this.type = json.type;
    this.user = json.user;

    if (json.parameter) {
      this.parameter = {
        processId: json.parameter.procId,
        processName: json.parameter.procName,
        activityId: json.parameter.actId,
        activityName: json.parameter.actName,
        type: json.parameter.type
      };
    }
  }
}
