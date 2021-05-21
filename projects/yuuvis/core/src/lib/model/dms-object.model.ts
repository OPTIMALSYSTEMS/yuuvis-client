import { SearchResultItem } from '../service/search/search.service.interface';
import { BaseObjectTypeField, ClientDefaultsObjectTypeField } from '../service/system/system.enum';
import { ObjectType } from '../service/system/system.interface';
import { DmsObjectContent, DmsObjectContext, DmsObjectRights } from './dms-object.interface';
/**
 * `DmsObject` is a business object of a type that  generally contain a document file in addition to its metadata.
 *  Document file can be text documents, e-mails, image files, video, etc.
 *  Each object type classifies the object and defines the properties that the object must have or is allowed to have.
 */
export class DmsObject {
  id: string;
  title: string;
  description: string;
  parentId: string;
  /**
   * content includes a content id, file size and a mimeType of the object as well
   */
  content: DmsObjectContent;
  data: any;
  /**
   * context folder includes an objectType id, this own id, title and description as well
   */
  contextFolder: DmsObjectContext;
  isFolder: boolean;
  objectTypeId: string;
  /**
   * rights for read and change a DmsObject
   */
  rights: DmsObjectRights = {
    readIndexData: false,
    readContent: false,
    writeIndexData: false,
    writeContent: false,
    deleteObject: false,
    deleteContent: false
  };
  contentStreamAllowed: string;
  version: number;
  created: {
    on: Date;
    by: { id: string; title?: string; name?: string };
  };
  modified: {
    on: Date;
    by: { id: string; title?: string; name?: string };
  };

  /**
   * @ignore
   */
  constructor(searchResultItem: SearchResultItem, objectType: ObjectType) {
    this.id = searchResultItem.fields.get(BaseObjectTypeField.OBJECT_ID);
    this.version = searchResultItem.fields.get(BaseObjectTypeField.VERSION_NUMBER);
    this.objectTypeId = searchResultItem.objectTypeId;

    // title and description are provided by the client defaults SOT that may not be present all the time
    this.title = searchResultItem.fields.get(ClientDefaultsObjectTypeField.TITLE);
    this.description = searchResultItem.fields.get(ClientDefaultsObjectTypeField.DESCRIPTION);

    this.parentId = searchResultItem.fields.get(BaseObjectTypeField.PARENT_ID);
    this.data = this.generateData(searchResultItem.fields);

    this.isFolder = objectType.isFolder;
    this.contentStreamAllowed = objectType.contentStreamAllowed;

    this.created = {
      on: searchResultItem.fields.get(BaseObjectTypeField.CREATION_DATE),
      by: {
        id: searchResultItem.fields.get(BaseObjectTypeField.CREATED_BY)
      }
    };
    this.modified = {
      on: searchResultItem.fields.get(BaseObjectTypeField.MODIFICATION_DATE),
      by: {
        id: searchResultItem.fields.get(BaseObjectTypeField.MODIFIED_BY)
      }
    };

    if (searchResultItem.content) {
      this.content = {
        contentStreamId: searchResultItem.content.contentStreamId,
        fileName: searchResultItem.content.fileName,
        size: searchResultItem.content.size,
        mimeType: searchResultItem.content.mimeType
      };
    }

    if (searchResultItem.permissions) {
      this.rights.readIndexData = searchResultItem.permissions.read && searchResultItem.permissions.read.includes('metadata');
      this.rights.readContent = searchResultItem.permissions.read && searchResultItem.permissions.read.includes('content');
      this.rights.writeIndexData = searchResultItem.permissions.write && searchResultItem.permissions.write.includes('metadata');
      this.rights.writeContent = searchResultItem.permissions.write && searchResultItem.permissions.write.includes('content');
      this.rights.deleteObject = searchResultItem.permissions.delete && searchResultItem.permissions.delete.includes('object');
      this.rights.deleteContent = searchResultItem.permissions.delete && searchResultItem.permissions.delete.includes('content');
    }

    // TODO: setup contextfolder
  }

  /**
   * Get the value (state) of a certain tag
   * @param name The tags name
   * @returns The value of the tag or null if the tag does not exist
   */
  getTag(name: string): any {
    const tags = this.data[BaseObjectTypeField.TAGS];
    const tag = tags ? tags.find((t) => t[0] === name) : null;
    return tag ? tag[1] : null;
  }

  private generateData(fields) {
    const result = {};
    for (const [key, val] of fields.entries()) {
      result[key] = val;
    }
    return result;
  }
}
