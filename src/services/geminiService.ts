import { GoogleGenAI, Type } from "@google/genai";
import type { CategorizationResponse } from '../types';

// The API Key is now sourced directly from environment variables.
const API_KEY = process.env.VITE_GEMINI_API_KEY;
// This service is now only used for the mock API flow. In production, the backend handles Gemini calls.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const model = 'gemini-2.5-flash';
const issueCategories = ['Pothole', 'Garbage', 'Streetlight', 'Graffiti', 'Flooding', 'Damaged Signage', 'Other'];

export const categorizeIssue = async (description: string, images?: {imageBase64: string, mimeType: string}[] | null): Promise<CategorizationResponse> => {
  if (!ai) {
    console.warn("Gemini API key not found. Returning fallback categorization.");
    return { category: 'Other', title: 'Issue Report (Fallback)' };
  }

  try {
    const parts: ({ inlineData: { mimeType: string; data: string; }; } | { text: string; })[] = [];
    let promptText: string;

    if (images && images.length > 0) {
      images.forEach(image => {
        const imagePart = {
          inlineData: {
            mimeType: image.mimeType,
            data: image.imageBase64,
          },
        };
        parts.push(imagePart);
      });
      promptText = `Analyze the user's report about a civic issue. Based on the description and image(s), categorize it into one of the following: ${issueCategories.join(', ')}. Also, create a concise title for the report.

      User Description: "${description}"

      Return a JSON object with 'category' and 'title' keys.`;
    } else {
      promptText = `Analyze the user's report about a civic issue. Based ONLY on the following description, categorize it into one of the following: ${issueCategories.join(', ')}. Also, create a concise title for the report.

      User Description: "${description}"

      Return a JSON object with 'category' and 'title' keys.`;
    }
    
    const textPart = {
      text: promptText,
    };
    parts.push(textPart);

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    category: { 
                        type: Type.STRING,
                        description: `The category of the issue. Must be one of: ${issueCategories.join(', ')}.`
                    },
                    title: { 
                        type: Type.STRING,
                        description: 'A concise title for the issue report.'
                    },
                },
                required: ["category", "title"],
            },
        },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    
    // Validate the category
    if (!issueCategories.includes(result.category)) {
      result.category = 'Other';
    }

    return result as CategorizationResponse;

  } catch (error) {
    console.error("Error categorizing issue with Gemini:", error);
    // Fallback in case of API error
    return {
      category: 'Other',
      title: 'Issue Report',
    };
  }
};
