export enum IssueStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  ForReview = 'For Review',
  Resolved = 'Resolved',
}

export enum UserRole {
  Citizen = 'Citizen',
  Worker = 'Worker',
  Admin = 'Admin',
  Service = 'Service',
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: Date;
}

export interface CivicIssue {
  id:string;
  title: string;
  description: string;
  category: string;
  photoUrls: string[];
  location: {
    lat: number;
    lng: number;
  };
  status: IssueStatus;
  createdAt: Date;
  reporterId: string;
  reporterName: string; // denormalized for easy display
  assignedTo?: string; // worker's email
  assignedToName?: string; // worker's full name
  comments: Comment[];
  rating?: number; // Rating from 1 to 5
}

export interface User {
  email: string;
  password?: string; // Will be undefined when fetched for client side
  firstName: string;
  lastName: string;
  mobileNumber: string;
  role: UserRole;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface CategorizationResponse {
  category: string;
  title: string;
}
