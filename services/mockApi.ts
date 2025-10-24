import type { CivicIssue, User } from '../types';
import { IssueStatus } from '../types';

// Initialize with some mock data if localStorage is empty
const initializeData = () => {
  if (!localStorage.getItem('civic_issues')) {
    const mockIssues: CivicIssue[] = [
      {
        id: '1',
        title: 'Large Pothole on Main St',
        description: 'A large and dangerous pothole has formed in the eastbound lane of Main St, just before the intersection with Oak Ave.',
        category: 'Pothole',
        photoUrl: 'https://images.unsplash.com/photo-1599389392885-2023a6358178?q=80&w=800&auto=format&fit=crop',
        location: { lat: 34.0522, lng: -118.2437 },
        status: IssueStatus.Pending,
        createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
        reporterId: 'admin@example.com',
        reporterName: 'Admin User',
      },
      {
        id: '2',
        title: 'Graffiti on Park Bench',
        description: 'The main bench near the playground in Central Park has been vandalized with spray paint.',
        category: 'Graffiti',
        photoUrl: 'https://images.unsplash.com/photo-1618331835712-40413159d3a3?q=80&w=800&auto=format&fit=crop',
        location: { lat: 34.055, lng: -118.245 },
        status: IssueStatus.InProgress,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        reporterId: 'jane.doe@example.com',
        reporterName: 'Jane Doe',
      },
       {
        id: '3',
        title: 'Streetlight Out on 5th Ave',
        description: 'The streetlight at the corner of 5th and Pine is out. It is very dark at night and feels unsafe.',
        category: 'Streetlight',
        photoUrl: 'https://images.unsplash.com/photo-1603525549332-06741a4561f2?q=80&w=800&auto=format&fit=crop',
        location: { lat: 34.058, lng: -118.250 },
        status: IssueStatus.Resolved,
        createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
        reporterId: 'jane.doe@example.com',
        reporterName: 'Jane Doe',
      },
    ];
    localStorage.setItem('civic_issues', JSON.stringify(mockIssues.map(issue => ({...issue, createdAt: issue.createdAt.toISOString()}))));
  }

  if (!localStorage.getItem('civic_users')) {
    const mockUsers: User[] = [
        { email: 'admin@example.com', password: 'password123', firstName: 'Admin', lastName: 'User', mobileNumber: '555-123-4567' },
        { email: 'jane.doe@example.com', password: 'password123', firstName: 'Jane', lastName: 'Doe', mobileNumber: '555-987-6543' },
    ];
    localStorage.setItem('civic_users', JSON.stringify(mockUsers));
  }
};

initializeData();

const getUsers = (): User[] => JSON.parse(localStorage.getItem('civic_users') || '[]');
const getIssues = (): CivicIssue[] => {
    const issues = JSON.parse(localStorage.getItem('civic_issues') || '[]');
    return issues.map((issue: any) => ({ ...issue, createdAt: new Date(issue.createdAt) }));
};

const saveUsers = (users: User[]) => localStorage.setItem('civic_users', JSON.stringify(users));
const saveIssues = (issues: CivicIssue[]) => localStorage.setItem('civic_issues', JSON.stringify(issues.map(issue => ({...issue, createdAt: issue.createdAt.toISOString()}))));


// --- API Functions ---

export const apiRegister = (data: Omit<User, 'email'> & { email: string; password: string }): Promise<{ user: Omit<User, 'password'>, token: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getUsers();
      if (users.find(u => u.email === data.email)) {
        return reject(new Error('User already exists.'));
      }
      if (data.password.length < 8) {
        return reject(new Error('Password must be at least 8 characters.'));
      }
      const newUser: User = { ...data };
      users.push(newUser);
      saveUsers(users);

      const { password, ...userWithoutPassword } = newUser;
      const token = `mock-token-for-${userWithoutPassword.email}-${userWithoutPassword.firstName}-${userWithoutPassword.lastName}`;
      resolve({ user: userWithoutPassword, token });
    }, 500);
  });
};

export const apiLogin = (email: string, pass: string): Promise<{ user: Omit<User, 'password'>, token: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === pass);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        const token = `mock-token-for-${userWithoutPassword.email}-${userWithoutPassword.firstName}-${userWithoutPassword.lastName}`;
        resolve({ user: userWithoutPassword, token });
      } else {
        reject(new Error('Invalid credentials.'));
      }
    }, 500);
  });
};

export const apiGetIssues = (): Promise<CivicIssue[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(getIssues());
        }, 300);
    });
};

export const apiAddIssue = (issueData: Omit<CivicIssue, 'id' | 'createdAt' | 'status'>): Promise<CivicIssue> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const issues = getIssues();
            const newIssue: CivicIssue = {
                ...issueData,
                id: new Date().getTime().toString(),
                createdAt: new Date(),
                status: IssueStatus.Pending,
            };
            issues.push(newIssue);
            saveIssues(issues);
            resolve(newIssue);
        }, 500);
    });
};

export const apiUpdateIssueStatus = (id: string, newStatus: IssueStatus): Promise<CivicIssue> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const issues = getIssues();
            const issueIndex = issues.findIndex(i => i.id === id);
            if (issueIndex > -1) {
                issues[issueIndex].status = newStatus;
                saveIssues(issues);
                resolve(issues[issueIndex]);
            } else {
                reject(new Error("Issue not found."));
            }
        }, 300);
    });
};

// Mock function for uploading a photo
// In a real app, this would upload to a cloud service and return a URL
export const apiUploadPhoto = (photo: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Convert the file to a Base64 Data URL for persistent storage
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result as string);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(photo);
        }, 500);
    });
}