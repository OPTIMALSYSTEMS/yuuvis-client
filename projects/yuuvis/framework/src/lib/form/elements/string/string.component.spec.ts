import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
// import { BackendService, Config, Logger } from '@eo-sdk/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ChipsModule } from 'primeng/chips';
import { of as observableOf } from 'rxjs';
// import { ConfigStub, LoggerStub } from '../../../../../projects/eo-sdk/core/src/test/testStubs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { StringComponent } from './string.component';

describe('StringComponent', () => {
  let component: StringComponent;
  let fixture: ComponentFixture<StringComponent>;
  let service: BackendService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [StringComponent],
      imports: [FormsModule, AutoCompleteModule, ChipsModule],
      providers: [BackendService, { provide: Logger, userClass: LoggerStub }, { provide: Config, userClass: ConfigStub }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StringComponent);
    component = fixture.componentInstance;
    service = TestBed.get(BackendService);
    fixture.detectChanges();
  });

  beforeEach(() => {
    component.value = [];
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should react on enter with input', fakeAsync(() => {
    const enterEvent = { target: { value: 'input' } };

    component.onKeyUpEnter(enterEvent);
    expect(component.value).toEqual(['input']);
    expect(enterEvent.target.value).toEqual('');
  }));

  it('should react on enter with filled input', () => {
    const enterEvent = { target: { value: 'input' } };
    component.value = ['test das'];

    component.onKeyUpEnter(enterEvent);
    expect(component.value).toEqual(['test das', 'input']);
    expect(enterEvent.target.value).toEqual('');
  });

  it('should react on enter without input', () => {
    const enterEvent = { target: { value: '' } };
    component.onKeyUpEnter(enterEvent);
    expect(enterEvent.target.value).toEqual('');
    expect(component.value).toEqual([]);
  });

  it('should set the value from given value', () => {
    component.writeValue('test');
    expect(component.value).toEqual('test');

    component.writeValue('');
    expect(component.value).toEqual(null);
  });

  it('should set the autocomplete values', fakeAsync(() => {
    const returnValue = [
      { value: 'Test', score: 1.0 },
      { value: 'test', score: 1.0 },
      { value: 'testTemplate', score: 1.0 }
    ];
    spyOn(service, 'getSearchBase').and.returnValue('');
    spyOn(service, 'getJson').and.returnValue(observableOf(returnValue));
    component.autocompleteFn({ query: 'test' });

    expect(component.autocompleteRes).toEqual(['Test', 'test', 'testTemplate']);
  }));

  it('should validate Classification seatuation SEARCH', () => {
    component.situation = 'SEARCH';
    expect((component as any).validateClassification('')).toBeTruthy();
  });

  // it('should validate Classification email', () => {
  //   component.classification = 'email';
  //   expect((component as any).validateClassification('test@testmail.com')).toBeTruthy();
  // });

  // it('should validate Classification url', () => {
  //   component.classification = 'url';
  //   expect((component as any).validateClassification('https://www.google.de')).toBeTruthy();
  // });

  it('should validate Classification', () => {
    expect((component as any).validateClassification('lorem ipsum')).toBeFalsy();
  });
});
