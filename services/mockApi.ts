// This is a mock API to simulate a backend.
// It uses localStorage to persist data across browser reloads.

import type { CivicIssue, User, Comment } from '../types';
import { IssueStatus, UserRole } from '../types';

const USERS_KEY = 'civic_issue_tracker_users';
const ISSUES_KEY = 'civic_issue_tracker_issues';

// Helper to generate a short random ID
const generateId = () => Math.random().toString(36).substring(2, 10);

// Helper to calculate distance between two lat/lng points
const getDistance = (loc1: {lat: number, lng: number}, loc2: {lat: number, lng: number}) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
    const dLon = (loc2.lng - loc1.lng) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(loc1.lat * (Math.PI / 180)) * Math.cos(loc2.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const omitPassword = (user: User): Omit<User, 'password'> => {
    const { password, ...rest } = user;
    return rest;
};

// --- Data Initialization ---
const initializeData = () => {
  const seedUsers = (): User[] => {
    return [
      { email: 'citizen@example.com', password: 'password123', firstName: 'Jane', lastName: 'Citizen', mobileNumber: '555-0101', role: UserRole.Citizen },
      { email: 'worker@example.com', password: 'password123', firstName: 'John', lastName: 'Worker', mobileNumber: '555-0102', role: UserRole.Worker, location: { lat: 34.0522, lng: -118.2437 } },
      { email: 'worker2@example.com', password: 'password123', firstName: 'Maria', lastName: 'Garcia', mobileNumber: '555-0105', role: UserRole.Worker, location: { lat: 34.1522, lng: -118.3437 } },
      { email: 'admin@example.com', password: 'password123', firstName: 'Admin', lastName: 'User', mobileNumber: '555-0103', role: UserRole.Admin },
      { email: 'service@example.com', password: 'password123', firstName: 'Service', lastName: 'Desk', mobileNumber: '555-0104', role: UserRole.Service },
    ];
  };

  const seedIssues = (): CivicIssue[] => {
    return [
        {
            id: generateId(),
            title: 'Large Pothole on Main St',
            description: 'A very large and dangerous pothole has formed in the eastbound lane of Main St, just past the intersection with Oak Ave.',
            category: 'Pothole',
            photoUrls: ['https://placehold.co/600x400/cccccc/000000/png?text=Pothole'],
            location: { lat: 34.055, lng: -118.245 },
            status: IssueStatus.InProgress,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            reporterId: 'citizen@example.com',
            reporterName: 'Jane Citizen',
            assignedTo: 'worker@example.com',
            assignedToName: 'John Worker',
            comments: [
                { id: generateId(), authorId: 'admin@example.com', authorName: 'Admin User', text: 'John, please take a look at this.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10000) },
                { id: generateId(), authorId: 'worker@example.com', authorName: 'John Worker', text: 'On it. Will inspect this afternoon.', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
            ]
        },
        {
            id: generateId(),
            title: 'Graffiti on Park Wall',
            description: 'The main wall of Central Park has been vandalized with spray paint.',
            category: 'Graffiti',
            photoUrls: ['https://placehold.co/600x400/cccccc/000000/png?text=Graffiti'],
            location: { lat: 34.155, lng: -118.349 },
            status: IssueStatus.InProgress,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            reporterId: 'citizen@example.com',
            reporterName: 'Jane Citizen',
            assignedTo: 'worker2@example.com',
            assignedToName: 'Maria Garcia',
            comments: []
        },
         {
            id: generateId(),
            title: 'Flickering Streetlight',
            description: 'The streetlight at the corner of 5th and Elm is flickering constantly and needs to be replaced.',
            category: 'Streetlight',
            photoUrls: ['https://placehold.co/600x400/cccccc/000000/png?text=Streetlight'],
            location: { lat: 34.06, lng: -118.25 },
            status: IssueStatus.InProgress,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            reporterId: 'citizen@example.com',
            reporterName: 'Jane Citizen',
            assignedTo: 'worker@example.com',
            assignedToName: 'John Worker',
            comments: [
                { id: generateId(), authorId: 'worker@example.com', authorName: 'John Worker', text: 'Added to my route for tonight.', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
            ]
        },
        {
            id: generateId(),
            title: 'Overflowing Trash Can at Park Entrance',
            description: 'The trash can at the main entrance to Central Park is completely full and overflowing. Needs to be emptied.',
            category: 'Garbage',
            photoUrls: ['https://placehold.co/600x400/cccccc/000000/png?text=Garbage'],
            location: { lat: 34.156, lng: -118.350 },
            status: IssueStatus.Resolved,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            reporterId: 'citizen@example.com',
            reporterName: 'Jane Citizen',
            assignedTo: 'worker2@example.com',
            assignedToName: 'Maria Garcia',
            comments: [
                 { id: generateId(), authorId: 'worker2@example.com', authorName: 'Maria Garcia', text: 'Cleaned up.', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) }
            ],
            rating: 5,
        },
        {
            id: generateId(),
            title: 'Damaged Stop Sign',
            description: 'The stop sign at the corner of Pine and 3rd is bent and hard to see.',
            category: 'Damaged Signage',
            photoUrls: ['https://placehold.co/600x400/cccccc/000000/png?text=Signage'],
            location: { lat: 34.051, lng: -118.240 },
            status: IssueStatus.Resolved,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            reporterId: 'citizen@example.com',
            reporterName: 'Jane Citizen',
            assignedTo: 'worker@example.com',
            assignedToName: 'John Worker',
            comments: [],
            rating: 4,
        }
    ];
  };

  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers()));
  }
  if (!localStorage.getItem(ISSUES_KEY)) {
    localStorage.setItem(ISSUES_KEY, JSON.stringify(seedIssues()));
  }
};


// --- Data Accessors ---
const getUsers = (): User[] => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const getIssues = (): CivicIssue[] => {
    const issues = JSON.parse(localStorage.getItem(ISSUES_KEY) || '[]');
    // Dates are stored as strings in JSON, so we need to convert them back
    return issues.map((issue: any) => ({
        ...issue,
        createdAt: new Date(issue.createdAt),
        comments: issue.comments.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) })),
    }));
};
const saveUsers = (users: User[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
const saveIssues = (issues: CivicIssue[]) => localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));

const ensureAdminUser = () => {
    let users = getUsers();
    let admin = users.find(u => u.email === 'admin@example.com');
    if (admin) {
        if (admin.password !== 'password123' || admin.role !== UserRole.Admin) {
            admin.password = 'password123';
            admin.role = UserRole.Admin;
            saveUsers(users);
        }
    } else {
        users.push({ email: 'admin@example.com', password: 'password123', firstName: 'Admin', lastName: 'User', mobileNumber: '555-0103', role: UserRole.Admin });
        saveUsers(users);
    }
}

// Call initialization and ensure admin exists
initializeData();
ensureAdminUser();

// --- API Functions ---

// Wrap functions in a delay to simulate network latency
const simulateApi = <T>(fn: () => T, delay = 500): Promise<T> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                resolve(fn());
            } catch (error) {
                reject(error);
            }
        }, delay);
    });
};

const createToken = (user: Omit<User, 'password'>) => {
    try {
        return btoa(JSON.stringify(user));
    } catch (e) {
        // Fallback for environments where btoa might not be available or fails
        console.error("btoa failed, using fallback token", e);
        return `mock-token-for-${user.email}-${user.firstName}-${user.lastName}-${user.role}`;
    }
};


// --- AUTH ---
export const apiRegister = (data: Omit<User, 'role'> & { email: string, password: string }): Promise<{ user: Omit<User, 'password'>, token: string }> => {
    return simulateApi(() => {
        const users = getUsers();
        if (users.some(u => u.email === data.email)) {
            throw new Error('User with this email already exists.');
        }
        if (data.password.length < 8) {
            throw new Error('Password must be at least 8 characters long.');
        }
        const newUser: User = { ...data, role: UserRole.Citizen }; // Default role
        users.push(newUser);
        saveUsers(users);
        const userToEncode = omitPassword(newUser);
        const token = createToken(userToEncode);
        return { user: userToEncode, token };
    });
};

export const apiLogin = (email: string, password: string): Promise<{ user: Omit<User, 'password'>, token: string }> => {
    return simulateApi(() => {
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Invalid email or password.');
        }
        const userToEncode = omitPassword(user);
        const token = createToken(userToEncode);
        return { user: userToEncode, token };
    });
};

// --- ISSUES ---
export const apiGetIssues = (): Promise<CivicIssue[]> => simulateApi(() => getIssues());

export const apiGetSampleIssues = (): Promise<CivicIssue[]> => {
    return simulateApi(() => {
        return getIssues()
            .filter(issue => issue.status === IssueStatus.InProgress)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 3);
    });
};

export const apiGetResolvedSampleIssues = (): Promise<CivicIssue[]> => {
    return simulateApi(() => {
        return getIssues()
            .filter(issue => issue.status === IssueStatus.Resolved)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 3);
    });
};

export const apiGetMyReportedIssues = (email: string): Promise<CivicIssue[]> => {
    return simulateApi(() => getIssues().filter(issue => issue.reporterId === email));
};

export const apiGetMyAssignedIssues = (email: string): Promise<CivicIssue[]> => {
    return simulateApi(() => getIssues().filter(issue => issue.assignedTo === email));
};

export const apiGetIssueById = (id: string): Promise<CivicIssue> => {
    return simulateApi(() => {
        const issue = getIssues().find(i => i.id === id);
        if (!issue) throw new Error("Issue not found.");
        return issue;
    });
};

export const apiGetIssuesByUser = (searchTerm: string): Promise<CivicIssue[]> => {
    return simulateApi(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        const user = getUsers().find(u => u.email.toLowerCase() === lowerCaseSearch || u.mobileNumber === lowerCaseSearch);
        if (!user) return [];
        return getIssues().filter(issue => issue.reporterId === user.email);
    });
};

export const apiUploadPhoto = (file: File): Promise<string> => {
    // In a real app, this would upload to a cloud service. Here, we just return a data URL.
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    });
};

export const apiAddIssue = (
    issueData: Omit<CivicIssue, 'id' | 'status' | 'createdAt' | 'comments' | 'rating'>
): Promise<CivicIssue> => {
    return simulateApi(() => {
        const issues = getIssues();
        const users = getUsers();
        const workers = users.filter(u => u.role === UserRole.Worker && u.location);
        
        let assignedTo: string | undefined = undefined;
        let assignedToName: string | undefined = undefined;

        // Auto-assign to the nearest worker
        if (workers.length > 0) {
            let closestWorker = workers[0];
            let minDistance = Infinity;

            for (const worker of workers) {
                if (worker.location) {
                    const distance = getDistance(issueData.location, worker.location);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestWorker = worker;
                    }
                }
            }
            assignedTo = closestWorker.email;
            assignedToName = `${closestWorker.firstName} ${closestWorker.lastName}`;
        }
        
        const newIssue: CivicIssue = {
            ...issueData,
            id: generateId(),
            status: assignedTo ? IssueStatus.Pending : IssueStatus.Pending,
            createdAt: new Date(),
            comments: [],
        };

        issues.push(newIssue);
        saveIssues(issues);
        return newIssue;
    });
};

export const apiUpdateIssueStatus = (id: string, newStatus: IssueStatus): Promise<CivicIssue> => {
    return simulateApi(() => {
        const issues = getIssues();
        const issueIndex = issues.findIndex(i => i.id === id);
        if (issueIndex === -1) throw new Error('Issue not found.');
        
        issues[issueIndex].status = newStatus;
        saveIssues(issues);
        return issues[issueIndex];
    });
};

export const apiCitizenResolveIssue = (issueId: string, rating: number, reporterId: string): Promise<CivicIssue> => {
    return simulateApi(() => {
        const issues = getIssues();
        const issueIndex = issues.findIndex(i => i.id === issueId);
        if (issueIndex === -1) throw new Error('Issue not found.');
        
        const issue = issues[issueIndex];
        if (issue.reporterId !== reporterId) {
            throw new Error('Only the original reporter can resolve this issue.');
        }
        if (issue.status !== IssueStatus.ForReview) {
            throw new Error('Issue must be in "For Review" status to be resolved by a citizen.');
        }
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5.');
        }

        issue.status = IssueStatus.Resolved;
        issue.rating = rating;
        saveIssues(issues);
        return issue;
    });
};

export const apiAdminAssignIssue = (issueId: string, workerEmail: string): Promise<CivicIssue> => {
    return simulateApi(() => {
        const issues = getIssues();
        const users = getUsers();
        const issueIndex = issues.findIndex(i => i.id === issueId);
        if (issueIndex === -1) throw new Error('Issue not found.');

        const worker = users.find(u => u.email === workerEmail && u.role === UserRole.Worker);
        if (!worker && workerEmail) throw new Error('Worker not found.');

        issues[issueIndex].assignedTo = worker ? worker.email : undefined;
        issues[issueIndex].assignedToName = worker ? `${worker.firstName} ${worker.lastName}` : undefined;
        
        saveIssues(issues);
        return issues[issueIndex];
    });
};

export const apiAddComment = (issueId: string, text: string, author: Omit<User, 'password'>): Promise<CivicIssue> => {
    return simulateApi(() => {
        const issues = getIssues();
        const issueIndex = issues.findIndex(i => i.id === issueId);
        if (issueIndex === -1) throw new Error('Issue not found.');

        const newComment: Comment = {
            id: generateId(),
            authorId: author.email,
            authorName: `${author.firstName} ${author.lastName}`,
            text,
            createdAt: new Date(),
        };

        issues[issueIndex].comments.push(newComment);
        saveIssues(issues);
        return issues[issueIndex];
    });
};


// --- USER MANAGEMENT (by Admin) ---
export const apiAdminGetAllUsers = (): Promise<Omit<User, 'password'>[]> => {
    return simulateApi(() => getUsers().map(omitPassword));
};

export const apiAdminUpdateUserRole = (email: string, newRole: UserRole): Promise<Omit<User, 'password'>> => {
    return simulateApi(() => {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex === -1) throw new Error("User not found.");
        users[userIndex].role = newRole;
        saveUsers(users);
        return omitPassword(users[userIndex]);
    });
};

export const apiAdminSetUserLocation = (email: string, location: { lat: number, lng: number }): Promise<Omit<User, 'password'>> => {
    return simulateApi(() => {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex === -1) throw new Error("User not found.");
        users[userIndex].location = location;
        saveUsers(users);
        return omitPassword(users[userIndex]);
    });
};

export const apiAdminCreateUser = (userData: User): Promise<Omit<User, 'password'>> => {
    return simulateApi(() => {
        const users = getUsers();
        if (users.some(u => u.email === userData.email)) {
            throw new Error("User with this email already exists.");
        }
        if (!userData.password || userData.password.length < 8) {
             throw new Error("Password must be at least 8 characters long.");
        }
        users.push(userData);
        saveUsers(users);
        return omitPassword(userData);
    });
};

// --- USER SELF-SERVICE ---
export const apiUpdateMyProfile = (email: string, data: { firstName: string, lastName: string, mobileNumber: string }): Promise<{ user: Omit<User, 'password'>, token: string }> => {
    return simulateApi(() => {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex === -1) throw new Error("User not found.");
        
        users[userIndex] = { ...users[userIndex], ...data };
        saveUsers(users);

        const updatedUser = omitPassword(users[userIndex]);
        const token = createToken(updatedUser);
        return { user: updatedUser, token };
    });
};

export const apiChangeMyPassword = (email: string, oldPass: string, newPass: string): Promise<void> => {
    return simulateApi(() => {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex === -1) throw new Error("User not found.");
        if (users[userIndex].password !== oldPass) throw new Error("Incorrect current password.");
        if (newPass.length < 8) throw new Error("New password must be at least 8 characters long.");

        users[userIndex].password = newPass;
        saveUsers(users);
    });
};

export const apiUpdateMyLocation = (email: string, location: { lat: number, lng: number }): Promise<Omit<User, 'password'>> => {
    return simulateApi(() => {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex === -1) throw new Error("User not found.");
        
        users[userIndex].location = location;
        saveUsers(users);
        return omitPassword(users[userIndex]);
    });
};