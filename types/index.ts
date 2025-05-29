export interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  verified: boolean;
  createdBy: string;
  createdAt: string;
  updates: EventUpdate[];
}

export interface EventUpdate {
  id: string;
  text: string;
  timestamp: string;
  createdBy: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}