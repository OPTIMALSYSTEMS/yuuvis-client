export interface PredictionClassifyResult {
  // predictions instance ID
  id: string;
  objectId: string;
  predictions: {
    [objectType: string]: [
      {
        probability: number;
        data?: any;
      }
    ];
  };
}
