export const noAccessTitle = '! *******';

export class YuvComponentRegister {
  private static reg = new Map<string, any>();

  static register(cmps: any[]) {
    cmps.forEach((c) => this.setComponent(c));
  }

  static setComponent(value: any, name?: string) {
    this.reg.set(name || value.ɵcmp.selectors[0][0], value);
  }

  static getComponent(name: string): any | undefined {
    return this.reg.get(name);
  }
}
