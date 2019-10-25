import { DmsObject } from '@yuuvis/core';
export class UploadTarget {
  /**
   * general filing target
   */
  public static ROOT = 'root';
  /**
   * add file(s) to context folder
   */
  public static CONTEXT = 'context';
  /**
   * add file(s) to context folders dynamic structure
   */
  public static CONTEXT_TREE = 'contexttree';
  /**
   * set/replace content file of a dms object
   */
  public static OBJECT = 'object';
  /**
   * custom targets (e.g. for plugin development)
   */
  public static CUSTOM = 'custom';

  public name: string;
  public description: string;
  /**
   * based on the upload targets type this is the dms object to
   * add/replace content file for (type: OBJECT) or the context folder
   * to add the files to (type: CONTEXT)
   */
  public referenceObject: DmsObject;

  /** TODO: enable once structure tree is in place
   * node from the structure service tree that may hold additional
   * data to be provide to the prepare service
   */
  //   public structureTreeNode: StructureTreeNode;

  /**
   * Creates a new instance of UploadTarget
   *
   * @param id Upload targets unique id
   * @param type Upload targets type
   */
  constructor(public id: string, public type: string) {}

  /**
   * Return Method if the Upload is Successfull
   *
   * @param target
   * @returns the provided UploadTarget if the Upload was Successfull.
   */
  public onUploadSuccess(target: any): any {
    return target;
  }

  /**
   * Return method if the Upload fails
   *
   * @returns an empty Object if the Upload fails
   */
  public onUploadFail(): {} {
    return {};
  }
}
