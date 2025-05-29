import { Event } from '@/types';

// Simulated data - in a real app, this would be fetched from an API
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'ICE Checkpoint on Main St',
    description: 'Checkpoint set up on Main Street near the intersection with 5th Avenue. Multiple vehicles and agents present.',
    type: 'Checkpoint',
    location: '123 Main St, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    date: '04/15/2025',
    time: '9:30 AM',
    verified: true,
    createdBy: 'user-123',
    createdAt: '2025-04-15T09:30:00Z',
    updates: [
      {
        id: 'update-1',
        text: 'Checkpoint still active, increased presence of agents.',
        timestamp: '10:45 AM',
        createdBy: 'user-456'
      }
    ]
  },
  {
    id: '2',
    title: 'Immigration Raid at Local Business',
    description: 'Officers spotted entering the building and checking employee documentation.',
    type: 'Raid',
    location: '456 Market St, San Francisco, CA',
    latitude: 37.7812,
    longitude: -122.3985,
    date: '04/14/2025',
    time: '2:15 PM',
    verified: true,
    createdBy: 'user-789',
    createdAt: '2025-04-14T14:15:00Z',
    updates: []
  },
  {
    id: '3',
    title: 'Traffic Stop on Mission St',
    description: 'Police stopping vehicles and asking for documentation.',
    type: 'Traffic Stop',
    location: '789 Mission St, San Francisco, CA',
    latitude: 37.7830,
    longitude: -122.4090,
    date: '04/16/2025',
    time: '11:00 AM',
    verified: false,
    createdBy: 'user-101',
    createdAt: '2025-04-16T11:00:00Z',
    updates: []
  }
];

export const getEvents = async (): Promise<Event[]> => {
  // Simulate API request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEvents);
    }, 1000);
  });
};

export const getEventById = async (id: string): Promise<Event> => {
  // Simulate API request
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const event = mockEvents.find(e => e.id === id);
      if (event) {
        resolve(event);
      } else {
        reject(new Error('Event not found'));
      }
    }, 1000);
  });
};

export const submitEvent = async (eventData: Partial<Event>): Promise<Event> => {
  // Simulate API request
  return new Promise((resolve) => {
    setTimeout(() => {
      const newEvent: Event = {
        id: `event-${Date.now()}`,
        title: eventData.title || '',
        description: eventData.description || '',
        type: 'Incident',
        location: eventData.location || '',
        latitude: eventData.latitude || 0,
        longitude: eventData.longitude || 0,
        date: eventData.date || '',
        time: eventData.time || '',
        verified: false,
        createdBy: 'user-123',
        createdAt: new Date().toISOString(),
        updates: []
      };
      
      resolve(newEvent);
    }, 1500);
  });
};