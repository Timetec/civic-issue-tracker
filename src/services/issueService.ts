import * as mockApi from './mockApi';
import * as authService from './authService';
import * as geminiService from './geminiService';
import * as userService from './userService';
import * as apiClient from './apiClient';
import type { CivicIssue, Comment, User } from '../types';
import { IssueStatus } from '../types';

const USE_REAL_API = !!process.env.VITE_API_BASE_URL;

// Helper to simulate network delay for mock API
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const fileToBase64 = (file: File): Promise<{imageBase64: string, mimeType: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ imageBase64: base64, mimeType: file.type });
    };
    reader.onerror = error => reject(error);
  });
};

const findNearestWorker = async (issueLocation: {lat: number, lng: number}): Promise<User | null> => {
    const users = await userService.getAllUsers();
    const workers = users.filter(u => u.role === 'Worker' && u.location);

    if (workers.length === 0) return null;

    const getDistance = (loc1: {lat: number, lng: number}, loc2: {lat: number, lng: number}) => {
        const R = 6371; // Radius of the Earth in km
        const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
        const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    let closestWorker = null;
    let minDistance = Infinity;

    for (const worker of workers) {
        if (worker.location) {
            const distance = getDistance(issueLocation, worker.location);
            if (distance < minDistance) {
                minDistance = distance;
                closestWorker = worker;
            }
        }
    }
    return closestWorker;
};

export const addIssue = async (description: string, photos: File[], location: { lat: number; lng: number }): Promise<CivicIssue> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('You must be logged in to report an issue.');
  }

  if (USE_REAL_API) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('location', JSON.stringify(location));
    photos.forEach(photo => {
        formData.append('photos', photo);
    });
    return apiClient.postForm<CivicIssue>('/api/issues', formData);
  } else {
    // Mock API Flow
    const imagePayloads = await Promise.all(photos.map(fileToBase64));
    const { category, title } = await geminiService.categorizeIssue(description, imagePayloads);
    const assignedWorker = await findNearestWorker(location);

    const newIssue: CivicIssue = {
      id: Math.random().toString(36).substring(2, 8),
      title,
      description,
      category,
      photoUrls: photos.length > 0 ? photos.map(p => URL.createObjectURL(p)) : ['https://placehold.co/600x400/cccccc/ffffff/png?text=No+Image'],
      location,
      status: IssueStatus.Pending,
      createdAt: new Date(),
      reporterId: currentUser.email,
      reporterName: `${currentUser.firstName} ${currentUser.lastName}`,
      assignedTo: assignedWorker?.email,
      assignedToName: assignedWorker ? `${assignedWorker.firstName} ${assignedWorker.lastName}` : undefined,
      comments: [],
    };

    await delay(1000);
    return mockApi.addIssue(newIssue);
  }
};

export const getIssues = async (): Promise<CivicIssue[]> => {
    if (USE_REAL_API) return apiClient.get<CivicIssue[]>('/api/issues');
    await delay(500);
    return mockApi.getAllIssues();
};

export const getMyReportedIssues = async (): Promise<CivicIssue[]> => {
    if (USE_REAL_API) return apiClient.get<CivicIssue[]>('/api/issues/reported');
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");
    await delay(500);
    return mockApi.getAllIssues().filter(issue => issue.reporterId === currentUser.email);
};

export const getMyAssignedIssues = async (): Promise<CivicIssue[]> => {
    if (USE_REAL_API) return apiClient.get<CivicIssue[]>('/api/issues/assigned');
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");
    await delay(500);
    return mockApi.getAllIssues().filter(issue => issue.assignedTo === currentUser.email);
};

export const getIssuesByUser = async (identifier: string): Promise<CivicIssue[]> => {
    if (USE_REAL_API) return apiClient.get<CivicIssue[]>(`/api/issues/user/${identifier}`);
    const serviceUser = authService.getCurrentUser();
    if (!serviceUser || serviceUser.role !== 'Service') throw new Error("Unauthorized");
    await delay(700);
    return mockApi.getAllIssues().filter(issue => issue.reporterId.includes(identifier) || issue.reporterName.toLowerCase().includes(identifier.toLowerCase()));
};

export const getIssueById = async(id: string): Promise<CivicIssue> => {
    if (USE_REAL_API) return apiClient.get<CivicIssue>(`/api/issues/${id}`);
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");
    await delay(400);
    const issue = mockApi.getIssueById(id);
    if (!issue) throw new Error("Issue not found");

    if(currentUser.role === 'Citizen' && issue.reporterId !== currentUser.email) {
        throw new Error("You are not authorized to view this issue.");
    }
    if(currentUser.role === 'Worker' && issue.assignedTo !== currentUser.email) {
        throw new Error("You are not authorized to view this issue.");
    }
    return issue;
}

export const updateIssueStatus = async (id: string, status: IssueStatus): Promise<CivicIssue> => {
    if (USE_REAL_API) return apiClient.put<CivicIssue>(`/api/issues/${id}/status`, { status });
    const currentUser = authService.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Worker')) {
        throw new Error("Unauthorized to update status");
    }
    await delay(300);
    return mockApi.updateIssue(id, { status });
};

export const citizenResolveIssue = async (id: string, rating: number): Promise<CivicIssue> => {
    if (USE_REAL_API) return apiClient.put<CivicIssue>(`/api/issues/${id}/resolve`, { rating });
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'Citizen') {
        throw new Error("Only the reporting citizen can resolve the issue.");
    }
    const issue = mockApi.getIssueById(id);
    if (!issue) throw new Error("Issue not found.");
    if (issue.reporterId !== currentUser.email) throw new Error("Unauthorized.");
    if (issue.status !== IssueStatus.ForReview) throw new Error("Issue must be marked 'For Review' before it can be resolved.");
    if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5.");
    await delay(300);
    return mockApi.updateIssue(id, { status: IssueStatus.Resolved, rating });
};

export const assignIssue = async (issueId: string, workerEmail: string): Promise<CivicIssue> => {
    if (USE_REAL_API) return apiClient.put<CivicIssue>(`/api/issues/${issueId}/assign`, { workerEmail });
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'Admin') {
        throw new Error("Only admins can assign issues.");
    }
    const worker = mockApi.findUserByEmail(workerEmail);
    if (!worker || worker.role !== 'Worker') {
        throw new Error("Invalid worker selected.");
    }
    await delay(300);
    return mockApi.updateIssue(issueId, { 
        assignedTo: worker.email, 
        assignedToName: `${worker.firstName} ${worker.lastName}`
    });
};

export const addComment = async (issueId: string, text: string): Promise<CivicIssue> => {
    if (USE_REAL_API) return apiClient.post<CivicIssue>(`/api/issues/${issueId}/comments`, { text });
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");
    const issue = mockApi.getIssueById(issueId);
    if (!issue) throw new Error("Issue not found");
    const newComment: Comment = {
        id: Math.random().toString(36).substring(2, 10),
        authorId: currentUser.email,
        authorName: `${currentUser.firstName} ${currentUser.lastName}`,
        text,
        createdAt: new Date(),
    };
    const updatedComments = [...issue.comments, newComment];
    await delay(200);
    return mockApi.updateIssue(issueId, { comments: updatedComments });
};
