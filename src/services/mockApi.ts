import type { CivicIssue, User, Comment } from '../types';
import { IssueStatus, UserRole } from '../types';

// --- Initialization ---
const init = () => {
  if (!localStorage.getItem('users')) {
    const adminUser: User = {
      email: 'admin@test.com',
      password: 'password',
      firstName: 'Admin',
      lastName: 'User',
      mobileNumber: '1234567890',
      role: UserRole.Admin,
    };
    localStorage.setItem('users', JSON.stringify([adminUser]));
  }
  if (!localStorage.getItem('issues')) {
    localStorage.setItem('issues', JSON.stringify([]));
  }
};
init();

// --- Helper Functions ---
// Fix: Export the getUsers function so it can be used in other services.
export const getUsers = (): User[] => JSON.parse(localStorage.getItem('users') || '[]');
const getIssues = (): CivicIssue[] => {
  const issues = JSON.parse(localStorage.getItem('issues') || '[]');
  // Convert date strings back to Date objects
  return issues.map((issue: CivicIssue) => ({
    ...issue,
    createdAt: new Date(issue.createdAt),
    comments: issue.comments.map((c: Comment) => ({...c, createdAt: new Date(c.createdAt)}))
  }));
};

const saveUsers = (users: User[]) => localStorage.setItem('users', JSON.stringify(users));
const saveIssues = (issues: CivicIssue[]) => localStorage.setItem('issues', JSON.stringify(issues));

// --- User API ---
export const findUserByEmail = (email: string): User | undefined => getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
export const addUser = (user: User): User => {
  const users = getUsers();
  if (findUserByEmail(user.email)) {
    throw new Error('User with this email already exists.');
  }
  users.push(user);
  saveUsers(users);
  return user;
};
export const updateUser = (email: string, updatedData: Partial<User>): User => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
        throw new Error('User not found.');
    }
    users[userIndex] = { ...users[userIndex], ...updatedData };
    saveUsers(users);
    return users[userIndex];
};

// --- Issue API ---
export const addIssue = (issue: CivicIssue): CivicIssue => {
  const issues = getIssues();
  issues.push(issue);
  saveIssues(issues);
  return issue;
};

export const getAllIssues = (): CivicIssue[] => getIssues();

export const getIssueById = (id: string): CivicIssue | undefined => getIssues().find(i => i.id === id);

export const updateIssue = (id: string, updates: Partial<CivicIssue>): CivicIssue => {
  let issues = getIssues();
  const issueIndex = issues.findIndex(i => i.id === id);
  if (issueIndex === -1) {
    throw new Error('Issue not found.');
  }
  issues[issueIndex] = { ...issues[issueIndex], ...updates };
  saveIssues(issues);
  return issues[issueIndex];
};