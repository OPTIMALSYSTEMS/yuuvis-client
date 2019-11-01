// import {TranslateServiceStub} from '../../../../../../test/mocks/test-stubs.mock';
// import {DmsObject} from '@eo-sdk/core';
// import {async, ComponentFixture, TestBed} from '@angular/core/testing';
// import {DownloadActionComponent} from './download-action';
// import {TranslateLoader, TranslateModule, TranslateService} from '@eo-sdk/core';

// describe('DownloadAction', () => {
//   let downloadActionComponent: DownloadActionComponent;
//   let fixture: ComponentFixture<DownloadActionComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [DownloadActionComponent],
//       imports: [TranslateModule.forRoot(), TranslateModule.forRoot({
//         loader: {provide: TranslateService, useClass: TranslateServiceStub}
//       })],
//       providers: [TranslateLoader]
//     }).compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(DownloadActionComponent);
//     downloadActionComponent = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('isExecutable should return true', () => {
//     const element = new DmsObject({id: 'testElement1', contentid: 'testElement1'});
//     downloadActionComponent
//       .isExecutable(element)
//       .subscribe(isExecutable => {
//         expect(isExecutable).toBe(true);
//       });
//   });

//   it('isExecutable should return false', () => {
//     const element = new DmsObject({id: 'testElement1'});
//     downloadActionComponent.isExecutable(element).subscribe(isExecutable => {
//       expect(isExecutable).toBe(false);
//     });
//   });

// });
