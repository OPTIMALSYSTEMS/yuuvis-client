import { Task } from '@yuuvis/core';

export const Task1: Task = {
  assignee: { id: 'c13c0dc6-c006-4eb7-b292-00ca49352549', title: 'Bartonitz, Martin (bartonitz)' },
  owner: null,
  initiator: { id: 'c13c0dc6-c006-4eb7-b292-00ca49352549', title: 'Bartonitz, Martin (bartonitz)' },
  processDefinition: { id: 'twosteptest_proc:2:f8e5a97c-e88f-11eb-bbdd-5a20cd388fd7', idPrefix: 'twosteptest_proc' },
  attachments: ['f74fbb98-c477-4da3-9262-b8d07b7f3ffa', 'c18493b8-7734-4ce7-b6e8-96322fe10790'],
  subject: 'Tasks subject',
  variables: [
    { name: 'whatAbout', type: 'string', value: 'Abnahme 4711', scope: 'global' },
    { name: 'documentId', type: 'string', value: 'f030f62d-6582-4e7b-8c17-94d9abd6dc9e', scope: 'global' }
  ],
  processInstanceId: 'ed953103-ef7d-11eb-8c02-aa3d2e69e2ba',
  createTime: new Date('2021-07-28T08:29:30.087Z'),
  formKey: 'getGroupId_Form',
  parentTaskId: null,
  name: 'Task-name: This task goes to initiator: c13c0dc6-c006-4eb7-b292-00ca49352549',
  description: null,
  id: 'ed95581c-ef7d-11eb-8c02-aa3d2e69e2ba',
  suspended: false,
  claimTime: null
};

export const Task2: Task = {
  assignee: { id: 'c13c0dc6-c006-4eb7-b292-00ca49352549', title: 'Bartonitz, Martin (bartonitz)' },
  owner: null,
  initiator: { id: 'c13c0dc6-c006-4eb7-b292-00ca49352549', title: 'Bartonitz, Martin (bartonitz)' },
  processDefinition: { id: 'twosteptest_proc:2:f8e5a97c-e88f-11eb-bbdd-5a20cd388fd7', idPrefix: 'twosteptest_proc' },
  attachments: [],
  subject: 'Task with desciption',
  variables: [
    { name: 'astring', type: 'string', value: 'A random string value', scope: 'global' },
    { name: 'aboolean', type: 'boolean', value: true, scope: 'global' },
    { name: 'anumber', type: 'integer', value: 4200, scope: 'global' },
    { name: 'ashort', type: 'short', value: 15, scope: 'global' },
    { name: 'adate', type: 'date', value: '2021-07-28T08:29:30.087Z', scope: 'global' }
  ],
  processInstanceId: 'ed953103-ef7d-11eb-8c02-aa3d2e69e2ba',
  createTime: new Date('2021-07-28T08:29:30.087Z'),
  formKey: 'getGroupId_Form',
  parentTaskId: null,
  name: 'Task-name: This task goes to initiator: c13c0dc6-c006-4eb7-b292-00ca49352549',
  description: 'This is a task with a description and a couple of variables',
  id: 'ed95581c-ef7d-11eb-8c02-aa3d2e69e2ba',
  suspended: false,
  claimTime: null
};
