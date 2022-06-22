export const noAccessTitle = '! *******';

export class YuvComponentRegister {
  private static reg = new Map<string, any>();

  static register(cmps: any[]) {
    cmps.forEach((c) => this.setComponent(c));
  }

  static setComponent(value: any, name?: string) {
    this.reg.set(name || this.getSelector(value), value);
  }

  static getSelector(value: any) {
    return value.ɵcmp.selectors[0][0];
  }

  static getComponent(name: string): any | undefined {
    return this.reg.get(name);
  }
}
