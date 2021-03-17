import { DmsObject, SecondaryObjectType } from '@yuuvis/core';

export interface FloatingSotSelectInput {
  dmsObject: DmsObject;
  sots: SecondaryObjectType[];
  // items that will be added to the list of selectable SOTs
  // (used e.g. for adding the general object type)
  additionalItems?: FloatingSotSelectItem[];
  isPrimary?: boolean;
}

export interface FloatingSotSelectItem {
  svgSrc: string;
  label: string;
  description?: string;
  disabled?: boolean;
  sot: SecondaryObjectType;
  prediction?: number;
}
