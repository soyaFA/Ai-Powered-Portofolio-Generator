import type {
  AIOptimizedContent,
  ActivitySummary,
  AnalyzedRepo,
  AuthResponse,
  AuthUser,
  CareerTrack,
  GitHubAnalysisResult,
  GitHubProfile,
  HealthStatus,
  LanguageBreakdown,
  PortfolioDocument,
} from '../types/portfolio';

const AUTH_TOKEN_KEY = 'folioforge_auth_token';

export function getStoredToken(): string | null {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
  }
}

export function clearStoredToken(): void {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
  }
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra ?? {}) };
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof (data as { error?: string }).error === 'string'
        ? (data as { error: string }).error
        : `Request failed with status ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const apiClient = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch('/api/health');
    return parseJsonOrThrow<HealthStatus>(res);
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
    githubUsername?: string;
  }): Promise<AuthResponse> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await parseJsonOrThrow<AuthResponse>(res);
    setStoredToken(data.token);
    return data;
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await parseJsonOrThrow<AuthResponse>(res);
    setStoredToken(data.token);
    return data;
  },

  async getCurrentUser(): Promise<{ user: AuthUser }> {
    const res = await fetch('/api/auth/me', {
      headers: authHeaders(),
    });
    return parseJsonOrThrow<{ user: AuthUser }>(res);
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return parseJsonOrThrow<{ message: string }>(res);
  },

  async resetPassword(
    code: string,
    password: string
  ): Promise<{ message: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, password }),
    });
    return parseJsonOrThrow<{ message: string }>(res);
  },

  async isResetEmailConfigured(): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/reset-email-configured');
      const data = await parseJsonOrThrow<{ emailConfigured: boolean }>(res);
      return data.emailConfigured;
    } catch {
      return false;
    }
  },

  logout(): void {
    clearStoredToken();
  },

  async analyzeGitHub(username: string): Promise<GitHubAnalysisResult> {
    const clean = username.trim().replace(/^@/, '');
    const res = await fetch(`/api/github/analyze/${encodeURIComponent(clean)}`, {
      headers: authHeaders(),
    });
    return parseJsonOrThrow<GitHubAnalysisResult>(res);
  },

  async optimizeContent(payload: {
    profile: GitHubProfile;
    topRepos: AnalyzedRepo[];
    languages: LanguageBreakdown[];
    activity: ActivitySummary;
    careerTrack?: CareerTrack;
    profileReadmeExcerpt?: string;
    variationIndex?: number;
  }): Promise<AIOptimizedContent> {
    const res = await fetch('/api/ai/optimize', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow<AIOptimizedContent>(res);
  },

  async listPortfolios(): Promise<PortfolioDocument[]> {
    const res = await fetch('/api/portfolios', {
      headers: authHeaders(),
    });
    return parseJsonOrThrow<PortfolioDocument[]>(res);
  },

  async savePortfolio(
    payload: Omit<PortfolioDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PortfolioDocument> {
    const res = await fetch('/api/portfolios', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return parseJsonOrThrow<PortfolioDocument>(res);
  },

  async updatePortfolio(
    id: string,
    updates: Partial<Omit<PortfolioDocument, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<PortfolioDocument> {
    const res = await fetch(`/api/portfolios/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updates),
    });
    return parseJsonOrThrow<PortfolioDocument>(res);
  },

  async deletePortfolio(id: string): Promise<{ deleted: boolean; id: string }> {
    const res = await fetch(`/api/portfolios/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return parseJsonOrThrow<{ deleted: boolean; id: string }>(res);
  },
};
