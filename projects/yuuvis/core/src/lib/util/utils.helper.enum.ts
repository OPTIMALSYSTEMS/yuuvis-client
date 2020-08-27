export enum Sort {
  ASC = 'asc',
  DESC = 'desc'
}

export enum ClassificationPrefix {
  EMAIL = 'mailto:',
  EMAIL_ICON = 'envelope',
  PHONE = 'tel:',
  PHONE_ICON = 'phone',
  URL = '',
  URL_ICON = 'globe'
}

export type FormattedMailTo = string | string[];
