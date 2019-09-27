import { Injectable } from '@angular/core';
import { BaseObjectTypeField, DmsObject, SecondaryObjectTypeField } from '@yuuvis/core';
@Injectable({
  providedIn: 'root'
})
export class AppDataService {
  getDmsObject(): DmsObject {
    const fields = new Map<string, any>();
    fields.set(BaseObjectTypeField.OBJECT_ID, '12345');

    fields.set('system:baseTypeId', 'enaio:document');
    fields.set(SecondaryObjectTypeField.TITLE, '51.4');
    fields.set(SecondaryObjectTypeField.DESCRIPTION, 'Jugendarbeit');
    fields.set(BaseObjectTypeField.TENANT, 'kolibri');
    fields.set(BaseObjectTypeField.MODIFICATION_DATE, '2019-08-19T12:16:55.210Z');
    fields.set(BaseObjectTypeField.CREATION_DATE, '2019-08-19T12:16:55.210Z');
    fields.set(BaseObjectTypeField.VERSION_NUMBER, 1);
    fields.set('tenKolibri:asvdescription', 'Jugendarbeit 3');
    fields.set('tenKolibri:asvvalue', '51.4');
    fields.set('tenKolibri:asvcreatable', true);
    fields.set(BaseObjectTypeField.MODIFIED_BY, 'Tool Cuckoo');
    fields.set(BaseObjectTypeField.CREATED_BY, 'Tool Cuckoo');
    fields.set(BaseObjectTypeField.OBJECT_TYPE_ID, 'tenKolibri:asvkatalogaktenplan');
    fields.set('system:secondaryObjectTypeIds', Array(1));
    fields.set('tenKolibri:asveditable', true);
    fields.set('system:traceId', 'dd2d9338ac02c7ee');
    fields.set('system:objectId', 'a1d86147-4333-43be-a0f4-00d6a265befb');

    return new DmsObject(
      {
        objectTypeId: 'email:email',
        fields: fields
      },
      false
    );
  }

  getDmsObjectWithContent() {
    const fields = new Map<string, any>();
    fields.set(BaseObjectTypeField.OBJECT_ID, '12345');
    fields.set(SecondaryObjectTypeField.TITLE, 'Mail to someone');
    fields.set(SecondaryObjectTypeField.DESCRIPTION, '...hurz');
    fields.set('enaio:baseTypeId', 'enaio:document');
    fields.set('email:to', ['Andreas Schulz <schulz@optimal-systems.de>']);
    fields.set('enaio:lastModificationDate', '2019-04-12T15:29:56.910Z');
    fields.set('enaio:versionNumber', 1);
    fields.set('email:from', 'Sven Kaiser <Kaiser@optimal-systems.de>');
    fields.set('email:subject', 'Neue OS-Webseiten sind LIVE');
    fields.set('enaio:objectTypeId', 'email:email');
    fields.set('email:bcc', ['Martin Bartonitz <bartonitz@optimal-systems.de>']);
    fields.set('enaio:traceId', '54d863be4e0ae849');
    fields.set('email:attachmentcount', 0);
    fields.set('enaio:tenant', 'kolibri');
    fields.set('email:cc', []);
    fields.set('enaio:creationDate', '2019-04-12T15:29:56.910Z');
    fields.set('enaio:lastModifiedBy', 'Martin Bartonitz');
    fields.set('enaio:createdBy', 'Martin Bartonitz');
    fields.set('enaio:objectId', 'ebb327ff-d7b2-4657-9f59-a3318fc5796e');
    fields.set('enaio:contentStreamLength', 60416);
    fields.set('enaio:contentStreamMimeType', 'application/vnd.ms-outlook');
    fields.set('enaio:contentStreamFileName', '02 Neue OS-Webseiten sind LIVE.msg');
    fields.set('enaio:contentStreamId', 'D3C1D523-5D37-11E9-AAA5-27E7DF182E4E');
    // fields.set('enaio:contentStreamRange', undefined);
    fields.set('enaio:contentStreamRepositoryId', 's3miniowithpath');
    fields.set('enaio:digest', 'F1F56858B92DC6E9242A2C03245575BE7B1FADC3D7119827BB7E117DC0D4DB46');
    fields.set('enaio:archivePath', 'kolibri/2019/04/12/');

    return new DmsObject(
      {
        objectTypeId: 'email:email',
        fields: fields
      },
      false
    );
  }
}
