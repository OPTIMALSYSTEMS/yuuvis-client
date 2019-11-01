// import {BackendServiceStub, TranslateServiceStub} from '../../../../../../test/mocks/test-stubs.mock';
// import {async, ComponentFixture, TestBed, fakeAsync} from '@angular/core/testing';
// import {DownloadPdfActionComponent} from './download-pdf-action';
// import {BackendService, DmsObject} from '@eo-sdk/core';
// import {TranslateLoader, TranslateModule, TranslateService} from '@eo-sdk/core';

// describe('DownloadPdfAction', () => {
//   let component: DownloadPdfActionComponent;
//   let fixture: ComponentFixture<DownloadPdfActionComponent>;
//   let service: BackendService;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [DownloadPdfActionComponent],
//       imports: [TranslateModule.forRoot(), TranslateModule.forRoot({
//         loader: {provide: TranslateService, useClass: TranslateServiceStub}
//       })],
//       providers: [TranslateLoader,
//         {provide: BackendService, useClass: BackendServiceStub}
//       ]
//     }).compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(DownloadPdfActionComponent);
//     service = TestBed.get(BackendService);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('isExecutable should return false for media mimetypes', () => {
//     const content = [{mimegroup: 'audio'}];
//     const element = new DmsObject({id: 'testElement1', contentid: 'testElement1', contents: content});
//     component.isExecutable(element).subscribe(isExecutable => {
//       expect(isExecutable).toBe(false);
//     });
//   });

//   it('isExecutable should return true', () => {
//     const element = new DmsObject({id: 'testElement1', contentid: 'testElement1', contents: [{mimegroup: 'image'}]});
//     component.isExecutable(element).subscribe(isExecutable => {
//       expect(isExecutable).toBe(true);
//     });
//   });

//   it('isExecutable should return false', () => {
//     const element = new DmsObject({id: 'testElement1'});
//     component.isExecutable(element).subscribe(isExecutable => {
//       expect(isExecutable).toBe(false);
//     });
//   });

//   it('run should call downloadContent', fakeAsync(() => {
//     const elements = [new DmsObject({id: 'testElement1'})];
//     let spy = spyOn(service, 'downloadContent');
//     component.run(elements);
//     expect(spy).toHaveBeenCalledWith(elements, 'PDF');
//   }));

// });
