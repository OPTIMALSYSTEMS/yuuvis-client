import { Injectable } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { scan } from 'rxjs/operators';
import { Breadcrumb, CreateState, CurrentStep } from './object-create.interface';

@Injectable()
export class ObjectCreateService {
  private state = new BehaviorSubject<CreateState>(this.defaultState);
  state$: Observable<CreateState> = this.state.pipe(scan((acc: CreateState, newVal: Partial<CreateState>) => ({ ...acc, ...newVal }), this.defaultState));

  private breadcrumb = new BehaviorSubject<Breadcrumb[]>(this.defaultBreadcrumb);
  breadcrumb$: Observable<Breadcrumb[]> = this.breadcrumb.asObservable();

  constructor(private translate: TranslateService) {}

  get defaultState(): CreateState {
    return {
      currentStep: CurrentStep.OBJECTTYPE,
      busy: false,
      done: false
    };
  }

  resetState() {
    this.state.next(this.defaultState);
  }

  setNewState(newState) {
    this.state.next(newState);
  }

  get defaultBreadcrumb(): Breadcrumb[] {
    const labels = {
      [CurrentStep.OBJECTTYPE]: this.translate.instant('yuv.framework.object-create.step.objecttype'),
      [CurrentStep.FILES]: this.translate.instant('yuv.framework.object-create.step.files'),
      [CurrentStep.INDEXDATA]: this.translate.instant('yuv.framework.object-create.step.indexdata')
    };

    return Object.keys(CurrentStep).map((step: CurrentStep) => ({
      step: CurrentStep[step],
      label: labels[CurrentStep[step]],
      visible: CurrentStep[step] === CurrentStep.OBJECTTYPE
    }));
  }

  resetBreadcrumb() {
    this.breadcrumb.next(this.defaultBreadcrumb);
  }

  setNewBreadcrumb(showStep: CurrentStep, hideStep?: CurrentStep) {
    const bread = [...this.breadcrumb.value];
    bread.map((crumb: Breadcrumb) => (crumb.step === showStep ? (crumb.visible = true) : crumb.step === hideStep ? (crumb.visible = false) : crumb));
    this.breadcrumb.next(bread);
  }
}
