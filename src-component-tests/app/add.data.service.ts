import { Injectable } from '@angular/core';
import { BaseObjectTypeField, DmsObject, SecondaryObjectTypeField, SystemService } from '@yuuvis/core';
@Injectable({
  providedIn: 'root'
})
export class AppDataService {
  constructor(private systemService: SystemService) {}

  getDmsObject(): DmsObject {
    const fields = new Map<string, any>();
    fields.set(BaseObjectTypeField.OBJECT_ID, '12345');

    fields.set('tristateCheckboxbaseTypeId', 'system:document');
    fields.set(SecondaryObjectTypeField.TITLE, '51.4');
    fields.set(SecondaryObjectTypeField.DESCRIPTION, 'Jugendarbeit');
    fields.set(BaseObjectTypeField.BASE_TYPE_ID, 'tristateCheckboxdocument');
    fields.set(BaseObjectTypeField.CREATED_BY, 'Tool Cuckoo');
    fields.set(BaseObjectTypeField.CREATION_DATE, '2019-08-19T12:16:55.210Z');
    fields.set(BaseObjectTypeField.MODIFICATION_DATE, '2019-08-19T12:16:55.210Z');
    fields.set(BaseObjectTypeField.MODIFIED_BY, 'Tool Cuckoo');
    fields.set(BaseObjectTypeField.OBJECT_ID, 'e8e5000e-a207-4a63-a583-b1a1f2f910a6');
    fields.set(BaseObjectTypeField.OBJECT_TYPE_ID, 'tenKolibri:asvkatalogaktenplan');
    fields.set('tristateCheckboxsecondaryObjectTypeIds', Array(1));
    fields.set(BaseObjectTypeField.TENANT, 'kolibri');
    fields.set(BaseObjectTypeField.TRACE_ID, '5b898ff518549448');
    fields.set(BaseObjectTypeField.VERSION_NUMBER, 1);
    fields.set('tenKolibri:asvdescription', 'Jugendarbeit 3');
    fields.set('tenKolibri:asvvalue', '51.4');
    fields.set('tenKolibri:asvcreatable', true);
    fields.set('tenKolibri:asveditable', true);
    fields.set('tristateCheckboxtraceId', 'dd2d9338ac02c7ee');
    fields.set('tristateCheckboxobjectId', 'a1d86147-4333-43be-a0f4-00d6a265befb');

    return new DmsObject(
      {
        objectTypeId: 'tenKolibri:asvkatalogaktenplan',
        fields: fields
      },
      this.systemService.getObjectType('tenKolibri:asvkatalogaktenplan')
    );
  }

  getDmsObjectWithContent() {
    const fields = new Map<string, any>();
    fields.set(BaseObjectTypeField.OBJECT_ID, '12345');
    fields.set(SecondaryObjectTypeField.TITLE, 'Mail to someone');
    fields.set(SecondaryObjectTypeField.DESCRIPTION, '...hurz');
    fields.set(BaseObjectTypeField.BASE_TYPE_ID, 'system:document');
    fields.set(BaseObjectTypeField.OBJECT_TYPE_ID, 'appAsv:asvemail');
    fields.set(BaseObjectTypeField.TRACE_ID, '59c362b455c0a415');
    fields.set(BaseObjectTypeField.TENANT, 'kolibri');
    fields.set(BaseObjectTypeField.MODIFICATION_DATE, '2019-04-12T15:29:56.910Z');
    fields.set(BaseObjectTypeField.VERSION_NUMBER, 1);
    fields.set(BaseObjectTypeField.CREATION_DATE, '2019-04-12T15:29:56.910Z');
    fields.set(BaseObjectTypeField.CREATED_BY, "Martonitz, Bartin (bartin)");
    fields.set(BaseObjectTypeField.MODIFIED_BY, "Martonitz, Bartin (bartin)");
    fields.set(BaseObjectTypeField.OBJECT_ID, 'ebb327ff-d7b2-4657-9f59-a3318fc5796e');
    fields.set('appAsv:asvto', ['Alex Scholz <scholz@optimal-systems.de>', 'Würgen Jidiker <jidiker@optimal-systems.de>']);
    fields.set('system:contentStreamLength', 60416);
    fields.set('system:contentStreamMimeType', 'application/vnd.ms-outlook');
    fields.set('system:contentStreamFileName', '02 Neue OS-Webseiten sind LIVE.msg');
    fields.set('system:contentStreamId', 'D3C1D523-5D37-11E9-AAA5-27E7DF182E4E');
    fields.set('system:contentStreamRepositoryId', 's3miniowithpath');
    fields.set('system:digest', 'F1F56858B92DC6E9242A2C03245575BE7B1FADC3D7119827BB7E117DC0D4DB46');
    fields.set('system:archivePath', 'kolibri/2019/04/12/');

    return new DmsObject(
      {
        objectTypeId: 'appAsv:asvemail',
        fields: fields
      },
      this.systemService.getObjectType('appAsv:asvemail')
    );
  }
}
