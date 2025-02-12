export interface Camper {
  id: number;
  fullName: string;
  institution: string;
  leader: string;
  sequentialNumber: number;
  birthDate: string;
  age: number;
  gender: 'M' | 'F';
  phone?: string;
  address?: string;
  department?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface Leader {
  id: string;
  name: string;
  assignedSpots: number;
  usedSpots: number;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  attachments: File[];
}

export interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
}

export interface TrackingEntry {
  id: number;
  camperId: number;
  decision: 'accepted' | 'reconciled';
  date: string;
}

export interface Document {
  id: number;
  title: string;
  description: string;
  url: string;
  uploadDate: string;
  fileType: string;
}