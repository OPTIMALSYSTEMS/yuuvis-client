export interface AboutData {
  libraries: Libraries[];
  version: string;
  releasedate: string;
  author: string;
}

export interface Libraries {
  name: string;
  version: string;
  license: string;
  link?: string;
  label?: string;
}

export interface ProductDetails {
  name: string;
  label: string;
  value: string;
  entry: any;
}
