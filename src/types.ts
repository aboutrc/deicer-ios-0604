export type MarkerCategory = 'ice' | 'observer';

export interface Marker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  category: MarkerCategory;
  createdAt: Date;
  active: boolean;
  imageUrl: string | null;
  lastConfirmed?: Date;
  reliability_score?: number;
  negative_confirmations?: number;
}

interface MarkerFormData {
  category: MarkerCategory;
  imageFile?: File;
}