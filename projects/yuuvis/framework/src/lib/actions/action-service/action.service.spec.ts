import { TestBed, ComponentFixture, fakeAsync, waitForAsync } from '@angular/core/testing';
import {AgentService} from '../../../eo-framework-core/agent/agent.service';

import {ActionService} from './action.service';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TranslateService, TranslateModule, TranslateLoader} from '@eo-sdk/core';

import {RouterTestingModule} from '@angular/router/testing';

import {InboxItem, DmsObject, UserService, SystemService, EventService, DmsService, ClipboardService, CapabilitiesService, BackendService,
  BpmService, NotificationsService} from '@eo-sdk/core';

import {
  TranslateServiceStub,
  PluginsServiceStub,
  NotificationsServiceStub,
  BpmServiceStub,
  CapabilitiesServiceStub,
  ClipboardServiceStub,
  AgentServiceStub,
  UserServiceStub,
  EventServiceStub,
  DmsServiceStub,
  SystemServiceStub, BackendServiceStub
} from '../../../../../test/mocks/test-stubs.mock';
import {
  MockComponent,
  ActionsTestModule
} from '../../../../../test/mocks/action.components.mock';
import {PluginsService} from '../../../eo-framework-core/api/plugins.service';

describe('ActionService', () => {
  let component: MockComponent;
  let fixture: ComponentFixture<MockComponent>;
  let service: ActionService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [RouterTestingModule.withRoutes([]), TranslateModule.forRoot({
        loader: {provide: TranslateService, useClass: TranslateServiceStub}
      }), ActionsTestModule.forRoot()],
      declarations: [MockComponent],
      providers: [TranslateLoader, ActionService,
        {provide: PluginsService, useClass: PluginsServiceStub},
        {provide: NotificationsService, useClass: NotificationsServiceStub},
        {provide: BpmService, useClass: BpmServiceStub},
        {provide: ClipboardService, useClass: ClipboardServiceStub},
        {provide: AgentService, useClass: AgentServiceStub},
        {provide: UserService, useClass: UserServiceStub},
        {provide: EventService, useClass: EventServiceStub},
        {provide: DmsService, useClass: DmsServiceStub},
        {provide: SystemService, useClass: SystemServiceStub},
        {provide: BackendService, useClass: BackendServiceStub},
        {provide: CapabilitiesService, useClass: CapabilitiesServiceStub}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MockComponent);
    service = TestBed.get(ActionService);
    component = fixture.componentInstance;
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getActionsList() should only return actions for type DmsObject', fakeAsync(() => {
    const elements = [new DmsObject({id: 'testElement1'})];

    service.getActionsList(elements, component.viewContainerRef)
      .subscribe(actionsList => {
        expect(actionsList.length).toBe(1);
        expect(actionsList[0].target).toBe(DmsObject);
      });
  }));

  it('getActionsList() should only return actions for type InboxItem', fakeAsync(() => {
    const elements = [new InboxItem({id: 'testElement1'})];

    service.getActionsList(elements, component.viewContainerRef)
      .subscribe(actionsList => {
        expect(actionsList.length).toBe(1);
        expect(actionsList[0].target).toBe(InboxItem);
      });
  }));
});
