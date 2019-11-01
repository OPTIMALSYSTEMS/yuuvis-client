// import {async, ComponentFixture, TestBed} from '@angular/core/testing';
// import {DownloadOriginalActionComponent} from './download-original-action';
// import {BackendService, DmsObject} from '@eo-sdk/core';
// import {TranslateLoader, TranslateModule, TranslateService} from '@eo-sdk/core';
// import {BackendServiceStub, TranslateServiceStub} from '../../../../../../test/mocks/test-stubs.mock';

// describe('DownloadOriginalAction', () => {
//   let downloadOriginalActionComponent: DownloadOriginalActionComponent;
//   let fixture: ComponentFixture<DownloadOriginalActionComponent>;
//   let service: BackendService;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [DownloadOriginalActionComponent],
//       imports: [TranslateModule.forRoot(), TranslateModule.forRoot({
//         loader: {provide: TranslateService, useClass: TranslateServiceStub}
//       })],
//       providers: [TranslateLoader,
//         {provide: BackendService, useClass: BackendServiceStub}
//       ]
//     }).compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(DownloadOriginalActionComponent);
//     service = TestBed.get(BackendService);
//     downloadOriginalActionComponent = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('isExecutable should return true', () => {
//     const element = new DmsObject({id: 'testElement1', contentid: 'testElement1'});
//     downloadOriginalActionComponent.isExecutable(element).subscribe(isExecutable => {
//       expect(isExecutable).toBe(true);
//     });
//   });

//   it('isExecutable should return false', () => {
//     const element = new DmsObject({id: 'testElement1'});
//     downloadOriginalActionComponent
//       .isExecutable(element)
//       .subscribe(isExecutable => {
//         expect(isExecutable).toBe(false);
//       });
//   });

//   it('run should call downloadContent', async(() => {
//     const elements = [new DmsObject({id: 'testElement1'})];
//     let spy = spyOn(service, 'downloadContent');
//     downloadOriginalActionComponent.run(elements);
//     expect(spy).toHaveBeenCalledWith(elements);
//   }));
// });
