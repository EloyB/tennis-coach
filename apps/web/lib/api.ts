const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5241';
const TOKEN_KEY = 'tennis_coach_token';

export enum SessionType {
  Individual = 0,
  Group = 1,
}

export enum SessionStatus {
  Scheduled = 0,
  Completed = 1,
  Cancelled = 2,
}

export interface TrainingSession {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  type: SessionType;
  status: SessionStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateTrainingSessionRequest {
  scheduledAt: string;
  durationMinutes: number;
  type: SessionType;
  notes?: string | null;
}

export interface UpdateTrainingSessionRequest {
  scheduledAt: string;
  durationMinutes: number;
  type: SessionType;
  notes?: string | null;
}

export interface Coach {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  coach: Coach;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

interface ApiResponse<T> {
  data: T;
}

interface ApiError {
  error: string;
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit & { skipAuth?: boolean }
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    if (token && !options?.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      throw new UnauthorizedError();
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as ApiError;
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<ApiResponse<AuthResponse>>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
        skipAuth: true,
      }
    );
    this.setToken(response.data.token);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<ApiResponse<AuthResponse>>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(data),
        skipAuth: true,
      }
    );
    this.setToken(response.data.token);
    return response.data;
  }

  async getCurrentCoach(): Promise<Coach> {
    const response = await this.request<ApiResponse<Coach>>('/api/auth/me');
    return response.data;
  }

  logout(): void {
    this.clearToken();
  }

  // Training Sessions endpoints
  async getTrainingSessions(): Promise<TrainingSession[]> {
    const response = await this.request<ApiResponse<TrainingSession[]>>(
      '/api/training-sessions'
    );
    return response.data;
  }

  async getTrainingSession(id: string): Promise<TrainingSession> {
    const response = await this.request<ApiResponse<TrainingSession>>(
      `/api/training-sessions/${id}`
    );
    return response.data;
  }

  async createTrainingSession(
    data: CreateTrainingSessionRequest
  ): Promise<TrainingSession> {
    const response = await this.request<ApiResponse<TrainingSession>>(
      '/api/training-sessions',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  async updateTrainingSession(
    id: string,
    data: UpdateTrainingSessionRequest
  ): Promise<TrainingSession> {
    const response = await this.request<ApiResponse<TrainingSession>>(
      `/api/training-sessions/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  }

  async cancelTrainingSession(id: string): Promise<TrainingSession> {
    const response = await this.request<ApiResponse<TrainingSession>>(
      `/api/training-sessions/${id}/cancel`,
      {
        method: 'POST',
      }
    );
    return response.data;
  }

  async completeTrainingSession(id: string): Promise<TrainingSession> {
    const response = await this.request<ApiResponse<TrainingSession>>(
      `/api/training-sessions/${id}/complete`,
      {
        method: 'POST',
      }
    );
    return response.data;
  }
}

export const api = new ApiClient(API_BASE_URL);
