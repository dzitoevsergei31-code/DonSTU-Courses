/* eslint-disable @typescript-eslint/no-explicit-any */
// User types
export interface UserProfile {
  id: string;
  fullName: string;
  firstName?: string;
  email: string;
  bio: string;
  avatar?: string;
  dateOfBirth?: string;
  registrationDate: string;
  statistics: {
    averageScore: number;
    activeCourses: number;
    completedTopics: number;
    totalStudyTime: number;
  };
}

export interface AuthUser {
  profile: UserProfile;
  token?: string;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  duration: number;
  rating: number;
  enrollmentStatus?: 'active' | 'completed' | 'not_started';
  progress?: number;
  userProgress?: any[];
  lessons?: Topic[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  isFree: boolean;
  resources?: string[];
  videoUrl?: string;
  isCompleted?: boolean;
  userProgress?: number;
}

export interface TopicContent {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  courseTitle: string;
  resources: Resource[];
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  size?: string;
  url?: string;
}

// Quiz types
export interface Question {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'text';
  options: string[];
  points: number;
  explanation: string;
  correctAnswers: number[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  maxAttempts: number;
  questionsCount: number;
  questions: Question[];
  courseTitle: string;
  userStats: {
    totalAttempts: number;
    lastScore: number;
    nextAttemptNumber: number;
    attemptsLeft: number;
  };
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  xpReward: number;
  progressPercentage?: number;
  earnedAt?: string;
}

export interface AchievementStats {
  total: number;
  earned: number;
  progress: number;
  totalXP: number;
  byRarity: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  iconType: 'course' | 'achievement' | 'reminder' | 'news' | 'system';
  bgColor: string;
  color: string;
  isRead: boolean;
  time: string;
  actionUrl?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  profile?: T;
  course?: T;
  courses?: T[];
  achievements?: T[];
  stats?: T;
  topic?: T;
  quiz?: T;
  notifications?: T[];
  user?: T;
  token?: string;
}

// Auth Context types
export interface AuthContextType {
  axios: any;
  token: string | null;
  authUser: AuthUser | null;
  loading: boolean;
  login: (state: string, formData: any) => Promise<boolean>;
  logout: () => void;
}