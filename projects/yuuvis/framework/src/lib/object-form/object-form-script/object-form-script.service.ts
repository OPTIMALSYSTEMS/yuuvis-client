import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BackendService, Logger } from '@yuuvis/core';
import * as lodash from 'lodash';
import * as moment_ from 'moment';
import { forkJoin as observableForkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ObjectFormScriptingScope } from './object-form-scripting-scope';

const moment = moment_;

@Injectable()
export class ObjectFormScriptService {
  constructor(private logger: Logger, private backend: BackendService) {}

  /**
   * Run a form script.
   * @param scope - the current scripting scope
   * @param script - the script to be executed
   * @param [scriptName] - the scripts name
   */
  public runFormScript(scope: ObjectFormScriptingScope, script: any, scriptName?: string) {
    try {
      // Define form script the function
      let formScriptFunction = this.defineFunction('Formscript/' + scriptName, script);
      // run the form script
      let formScriptReturn = formScriptFunction(scope, lodash, moment);
      // Check if the form script returns something and may export global scripts
      if (formScriptReturn) {
        this.importGlobalScriptsAndCallInit(scope, formScriptReturn);
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        alert('Syntax error in Form-Script. See console log for details.');
      }
      this.logger.error('Got script error', e);
    }
  }

  /**
   * Define form script function, appending source url as comment.
   * Enables debugging using browser debugging tools (Chrome+Firefox)
   * @see: https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Debug_eval_sources
   *
   * @param name - the name of the script
   * @param script - script to be wrapped in a function
   * @returns the function
   */
  private defineFunction(name: string, script: any): Function {
    // Appending source url as comment. See https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Debug_eval_sources
    // Enables debugging using browser debugging tools (Chrome+Firefox)
    // The line feed is needed, if the script has a comment in the last line
    return new Function('scope', '_', 'moment', script + '\n;//# sourceURL=' + name + '.js');
  }

  /**
   * If the script contains global script, this function will import and run them
   * before running the actual script.
   *
   * @param scope - the current scripting scope
   * @param formScriptReturn - the return value of the actual form script
   */
  private importGlobalScriptsAndCallInit(scope: ObjectFormScriptingScope, formScriptReturn: any) {
    if (!formScriptReturn.init) {
      return;
    }

    if (formScriptReturn.uses) {
      // collect the global script exports promises
      let exports = [];
      let globals = [];

      // collect Observables for fetching global scripts
      for (let use of formScriptReturn.uses) {
        globals.push(this.resolveGlobalScript(use, scope));
      }

      observableForkJoin(globals).subscribe(globalReturns => {
        for (let scriptReturn of globalReturns) {
          exports.push(scriptReturn['exports']);
        }
        // Invoke init function on form script return with the
        // collected exports using javascript apply magic
        formScriptReturn.init.apply(this, exports);
      });
    } else {
      // invoke init direct (no use of global scripts)
      formScriptReturn.init();
    }
  }

  /**
   * Fetch global scripts.
   * @param name - the name of the global script
   * @param scope - the current scripting scope
   * @returns
   */
  private resolveGlobalScript(name: string, scope: ObjectFormScriptingScope): Observable<any> {
    const requestOptions = {
      headers: new HttpHeaders({
        Accept: 'text/plain'
      }),
      responseType: 'text'
    };

    return this.backend.get(`/script/${name}/script`, null, requestOptions).pipe(
      map((res: any) => {
        // define the global function ...
        let globalScript = this.defineFunction('Global/' + name, res);
        // ... and run it
        return globalScript(scope, lodash, moment);
      })
    );
  }
}
