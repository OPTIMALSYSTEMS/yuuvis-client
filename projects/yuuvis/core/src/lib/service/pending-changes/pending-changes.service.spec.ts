import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Logger } from './../logger/logger';
import { PendingChangesComponent } from './pending-changes-component.interface';
import { PendingChangesService } from './pending-changes.service';

describe('PendingChangesService', () => {
  let component: Test1Component;

  let service: PendingChangesService;
  let translate: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateService, useClass: TranslateServiceStub }
        })
      ],
      providers: [TranslateLoader, PendingChangesService, { provide: Logger, useClass: LoggerStub }]
    });

    translate = TestBed.get(TranslateService);
    service = TestBed.get(PendingChangesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get pending tasks', () => {
    let taskIds = [];
    expect(service.hasPendingTask()).toBe(false);
    for (let i = 0; i < 3; i++) {
      taskIds[i] = service.startTask();
    }

    expect(service.hasPendingTask()).toBe(true);
    expect(service.hasPendingTask(taskIds[0])).toBe(true);
    expect(service.hasPendingTask(taskIds[1])).toBe(true);
    expect(service.hasPendingTask(taskIds[2])).toBe(true);

    service.finishTask(taskIds[0]);
    expect(service.hasPendingTask()).toBe(true);
    expect(service.hasPendingTask(taskIds[0])).toBe(false);
    expect(service.hasPendingTask(taskIds[1])).toBe(true);
    expect(service.hasPendingTask(taskIds[2])).toBe(true);

    service.finishTask(taskIds[2]);
    expect(service.hasPendingTask()).toBe(true);
    expect(service.hasPendingTask(taskIds[0])).toBe(false);
    expect(service.hasPendingTask(taskIds[1])).toBe(true);
    expect(service.hasPendingTask(taskIds[2])).toBe(false);

    service.finishTask(taskIds[1]);
    expect(service.hasPendingTask()).toBe(false);
    expect(service.hasPendingTask(taskIds[0])).toBe(false);
    expect(service.hasPendingTask(taskIds[1])).toBe(false);
    expect(service.hasPendingTask(taskIds[2])).toBe(false);
  });

  it('should ceck if there are pending changes', () => {
    const pdComp: PendingChangesComponent = component;
    expect(service.check()).toBeFalsy();
    expect(service.check(pdComp)).toBeFalsy();
  });
});
