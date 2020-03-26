import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { UploadTarget } from './model/upload-target.model';

@Injectable({
  providedIn: 'root'
})
export class UploadRegistryService {
  private _targets: UploadTarget[] = [];
  private targetsSource = new ReplaySubject<UploadTarget[]>(1);
  private overlayActive: boolean;
  /**
   * Stream of currently available upload targets
   */
  public uploadTargets$: Observable<UploadTarget[]> = this.targetsSource.asObservable();

  /**
   * @ignore
   */
  constructor() {}

  setOverlayActive(oa: boolean) {
    this.overlayActive = oa;
  }
  isOverlayActive() {
    return this.overlayActive;
  }

  /**
   * Registers a new upload target.
   * If there is an existing target with the same ID it will be updated.
   *
   * @param uploadTarget The target to be registered
   */
  register(uploadTarget: UploadTarget) {
    if (uploadTarget.referenceObject) {
      uploadTarget.description = uploadTarget.referenceObject.title;
      // TODO: enable once structure tree is in place
      // if (uploadTarget.structureTreeNode) {
      //   this.prepareService.getPrepareChildTypes(uploadTarget.referenceObject.id).subscribe(res => {
      //     if (this.isSubFolderAllowed(uploadTarget.structureTreeNode.data, res.types)) {
      //       uploadTarget.description += '; ' + uploadTarget.structureTreeNode.name;
      //     }
      //   });
      // }
    }

    const target = this._targets.find(t => t.id === uploadTarget.id);
    if (target) {
      Object.assign(target, uploadTarget);
    } else {
      this._targets.push(uploadTarget);
    }
    this.targetsSource.next(this._targets);
  }

  /**
   * Removes an upload target from the list of registered targets.
   *
   * @param uploadTargetId ID of the target to be removed
   */
  unregister(uploadTargetId: string) {
    this._targets = this._targets.filter(t => t.id !== uploadTargetId);
    this.targetsSource.next(this._targets);
  }

  // TODO: enable once structure tree is in place
  // /**
  //  * Checks if it is allowed to drop Files in SubFolders
  //  *
  //  * @param subFolder
  //  * @param ObjectType[] locationTypes
  //  * @returns boolean
  //  */
  // isSubFolderAllowed(subFolder: any, locationTypes: ObjectType[]): boolean {
  //   return !!locationTypes.find(lt => lt.name === subFolder.type);
  // }
}
