/**
 * Help to providing `DeviceService` for
 * adapt styles and designs of the client to different devices screen sizes.
 */
export interface Screen {
  mode: string;
  orientation: string;
  width: number;
  height: number;
  isPortrait: boolean;
  isLanscape: boolean;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isExtraLarge: boolean;
}
