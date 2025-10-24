// Fix: Added full content for types.ts
export enum IssueStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  photoUrl: string;
  location: {
    lat: number;
    lng: number;
  };
  status: IssueStatus;
  createdAt: Date;
  reporterId: string;
  reporterName: string; // denormalized for easy display
}

export interface User {
  email: string;
  password?: string; // Will be undefined when fetched for client side
  firstName: string;
  lastName: string;
  mobileNumber: string;
}

export interface CategorizationResponse {
  category: string;
  title: string;
}
