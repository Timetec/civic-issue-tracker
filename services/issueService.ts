import type { CivicIssue, Comment } from '../types';
import { IssueStatus } from '../types';
import * as api from './mockApi';
import * as geminiService from './geminiService';
import * as authService from './authService';

export const getIssues = (): Promise<CivicIssue[]> => {
  return api.apiGetIssues();
};

export const getSampleIssues = (): Promise<CivicIssue[]> => {
    return api.apiGetSampleIssues();
};

export const getResolvedSampleIssues = (): Promise<CivicIssue[]> => {
    return api.apiGetResolvedSampleIssues();
};

export const getMyReportedIssues = (): Promise<CivicIssue[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    return Promise.reject(new Error("User not authenticated."));
  }
  return api.apiGetMyReportedIssues(currentUser.email);
};

export const getMyAssignedIssues = (): Promise<CivicIssue[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    return Promise.reject(new Error("User not authenticated."));
  }
  return api.apiGetMyAssignedIssues(currentUser.email);
};

export const getIssueById = (id: string): Promise<CivicIssue> => {
  return api.apiGetIssueById(id);
};

export const getIssuesByUser = (searchTerm: string): Promise<CivicIssue[]> => {
  return api.apiGetIssuesByUser(searchTerm);
};

const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(',');
      if (!header || !data) {
        return reject(new Error("Invalid file format for base64 conversion."));
      }
      const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
      resolve({ base64: data, mimeType });
    };
    reader.onerror = error => reject(error);
  });
};


export const addIssue = async (
  description: string,
  photo: File | null,
  location: { lat: number; lng: number }
): Promise<CivicIssue> => {
  try {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated to add an issue.");
    }
    
    let imageBase64: string | null = null;
    let mimeType: string | null = null;
    let photoUrl: string = 'https://placehold.co/600x400/e2e8f0/cbd5e0/png?text=No+Image';

    if (photo) {
      const convertedFile = await fileToBase64(photo);
      imageBase64 = convertedFile.base64;
      mimeType = convertedFile.mimeType;
      photoUrl = await api.apiUploadPhoto(photo);
    }
    
    const { category, title } = await geminiService.categorizeIssue(description, imageBase64, mimeType);
    
    const newIssueData = {
        title,
        description,
        category,
        photoUrl,
        location,
        reporterId: currentUser.email,
        reporterName: `${currentUser.firstName} ${currentUser.lastName}`
    };

    const newIssue = await api.apiAddIssue(newIssueData);
    return newIssue;
  } catch (error) {
    console.error("Error adding issue:", error);
    throw error; // Re-throw to be handled by the UI
  }
};

export const updateIssueStatus = (id: string, newStatus: IssueStatus): Promise<CivicIssue> => {
  return api.apiUpdateIssueStatus(id, newStatus);
};

export const citizenResolveIssue = (issueId: string, rating: number): Promise<CivicIssue> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
        return Promise.reject(new Error("User not authenticated."));
    }
    return api.apiCitizenResolveIssue(issueId, rating, currentUser.email);
};

export const assignIssue = (issueId: string, workerEmail: string): Promise<CivicIssue> => {
  return api.apiAdminAssignIssue(issueId, workerEmail);
};

export const addComment = (issueId: string, text: string): Promise<CivicIssue> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    return Promise.reject(new Error("User not authenticated."));
  }
  return api.apiAddComment(issueId, text, currentUser);
};