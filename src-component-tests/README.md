# Flokfugl Components Test Application

The purpose of this testing application is to proviode a clean environment for library components to be developed and tested. Any component that is exposed by one of this projects UI-related libraries, should get its own page here.

## Start the application

Run `npm run start:cmp:test` and go to [http://localhost:4500](http://localhost:4500). As this application is pulling the components right from the libraries sources, you are able to work on those components while having a clean test environment.

## Create a new test

In `./src-component-tests/app` run `ng g c test-form-input --project component-tests`. That will create the test component.

In the component add a host class to apply the basic styles:

```ts
@Component({
  ...
  host: { class: 'yuv-test-container' }
})
```

In `app-routing.module.ts` add a path to point to the new test page:

```ts
{
    ...
    { path: 'form-input', component: TestFormInputComponent },
    ...
}
```
