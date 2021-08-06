/**
 * Events emitted by parts of the application
 */
export enum YuvEventType {
  LOGOUT = 'yuv.user.logout',
  CLIENT_LOCALE_CHANGED = 'yuv.user.locale.client.changed',
  DMS_OBJECT_LOADED = 'yuv.dms.object.loaded',
  DMS_OBJECT_CREATED = 'yuv.dms.object.created',
  DMS_OBJECT_DELETED = 'yuv.dms.object.deleted',
  DMS_OBJECT_UPDATED = 'yuv.dms.object.updated',
  DMS_OBJECTS_MOVED = 'yuv.dms.objects.moved'
}
