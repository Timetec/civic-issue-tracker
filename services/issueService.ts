import type { CivicIssue } from '../types';
import { IssueStatus } from '../types';
import * as api from './mockApi';
import * as geminiService from './geminiService';
import * as authService from './authService';

export const getIssues = (): Promise<CivicIssue[]> => {
  // Calls the mock API now
  return api.apiGetIssues();
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
  photo: File,
  location: { lat: number; lng: number }
): Promise<CivicIssue> => {
  // This function now uses client-side categorization and the mock API.
  try {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated to add an issue.");
    }
    
    // 1. Convert photo for Gemini API
    const { base64: imageBase64, mimeType } = await fileToBase64(photo);
    
    // 2. Get AI-powered category and title
    const { category, title } = await geminiService.categorizeIssue(description, imageBase64, mimeType);
    
    // 3. "Upload" photo using mock service (returns a data URL)
    const photoUrl = await api.apiUploadPhoto(photo);

    // 4. Prepare issue data for mock API
    const newIssueData = {
        title,
        description,
        category,
        photoUrl,
        location,
        reporterId: currentUser.email,
        reporterName: `${currentUser.firstName} ${currentUser.lastName}`
    };

    // 5. Add issue to mock database
    const newIssue = await api.apiAddIssue(newIssueData);
    return newIssue;
  } catch (error) {
    console.error("Error adding issue:", error);
    throw error; // Re-throw to be handled by the UI
  }
};

export const updateIssueStatus = (id: string, newStatus: IssueStatus): Promise<CivicIssue> => {
  // Calls the mock API now
  return api.apiUpdateIssueStatus(id, newStatus);
};