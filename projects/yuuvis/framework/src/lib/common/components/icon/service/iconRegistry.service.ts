import { Injectable } from '@angular/core';
import { Icon } from '../icon.interface';
/**
 * @ignore
 * Apply IconRegistryService for registering only used icons and reducing unnessesary JavaScript code.
 * This helps your client be more perfomanced.
 */
@Injectable()
export class IconRegistryService {
  private registry = new Map<string, string>();

  public registerIcons(icons: Icon[]): void {
    icons.forEach((icon: Icon) => this.registry.set(icon.name, icon.data));
  }

  public getIcon(iconName: string): string | undefined {
    if (!this.registry.has(iconName)) {
      // console.warn(`The Icon ${iconName} coult not be found, are you shure you added to the icon Registry?`);
      throw new Error(`The Icon ${iconName} coult not be found, are you shure you added to the icon Registry?`);
    }
    return this.registry.get(iconName);
  }
}
