
import type { CivicIssue } from '../types';
import { IssueStatus } from '../types';
import * as mockApi from './mockApi';
import * as geminiService from './geminiService';

export const getIssues = (): Promise<CivicIssue[]> => {
  return mockApi.apiGetIssues();
};

export const addIssue = async (
  description: string,
  photo: File,
  location: { lat: number; lng: number },
  reporter: { id: string; name: string }
): Promise<CivicIssue> => {
  // This function now follows a simple, direct path to create an issue
  // without any duplicate detection logic.
  try {
    // 1. "Upload" photo to get a URL from the mock API
    const photoUrl = await mockApi.apiUploadPhoto(photo);

    // 2. Convert photo to base64 for AI analysis
    const reader = new FileReader();
    const fileReadPromise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
    reader.readAsDataURL(photo);
    const imageBase64 = await fileReadPromise;

    // 3. Get AI categorization from Gemini
    const { category, title } = await geminiService.categorizeIssue(description, imageBase64, photo.type);

    // 4. Prepare the new issue data
    const newIssueData = {
      title,
      description,
      category,
      photoUrl,
      location,
      reporterId: reporter.id,
      reporterName: reporter.name,
    };

    // 5. Save the new issue via the mock API
    const newIssue = await mockApi.apiAddIssue(newIssueData as Omit<CivicIssue, 'id' | 'createdAt' | 'status'>);
    return newIssue;
  } catch (error) {
    console.error("Error adding issue:", error);
    throw error; // Re-throw to be handled by the UI
  }
};

export const updateIssueStatus = (id: string, newStatus: IssueStatus): Promise<CivicIssue> => {
  return mockApi.apiUpdateIssueStatus(id, newStatus);
};
