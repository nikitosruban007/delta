// Typed API client — all backend calls go through here

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

// ─── Error shape matching backend ────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function normalizeAvatarUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  const baseUrl = API_BASE.replace(/\/api\/?$/, '');
  return `${baseUrl}${value}`;
}

function normalizeAvatarUrls<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeAvatarUrls(item)) as unknown as T;
  }

  if (typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, item]) => {
      acc[key] = key === 'avatarUrl'
        ? normalizeAvatarUrl(item as string | null)
        : normalizeAvatarUrls(item as unknown as T);
      return acc;
    }, {} as Record<string, unknown>) as T;
  }

  return value;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!res.ok) {
    let body: { message?: string; error?: string } = {};
    try {
      body = await res.json();
    } catch {
      // ignore parse errors
    }
    throw new ApiError(
      res.status,
      body.message ?? body.error ?? `Request failed with status ${res.status}`,
      body,
    );
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as unknown as T;
  }

  const data = await res.json();
  return normalizeAvatarUrls(data) as T;
}

// ─── Shared types (contract with backend) ────────────────────────────────────

export type UserRole = 'ADMIN' | 'ORGANIZER' | 'JUDGE' | 'PARTICIPANT';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  roles: string[];
  permissions: string[];
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type TournamentStatus = 'draft' | 'registration' | 'active' | 'finished';

export type Tournament = {
  id: string;
  title: string;
  description: string | null;
  rules?: string | null;
  status: TournamentStatus;
  organizerId: string;
  registrationDeadline: string | null;
  startsAt: string | null;
  endsAt: string | null;
  maxTeams?: number | null;
  teamSizeMin?: number | null;
  teamSizeMax?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Announcement = {
  id: string;
  tournamentId: string;
  title: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null } | null;
};

export type LeaderboardCriterionCell = {
  criterionId: string;
  title: string;
  maxScore: number;
  averageScore: number | null;
};

export type TeamLeaderboardItem = {
  rank: number;
  teamId: string | null;
  teamName: string;
  totalScore: number;
  breakdown?: LeaderboardCriterionCell[];
};

export type LeaderboardCriterionHeader = {
  id: string;
  title: string;
  maxScore: number;
};

export type TeamLeaderboardResponse = {
  items: TeamLeaderboardItem[];
  criteria?: LeaderboardCriterionHeader[];
  cache: { key: string; hit: boolean };
  round?: { id: string; title: string };
};

export type FinishEvaluationResult = {
  tournamentId: string;
  status: 'finished';
  rankings: { rank: number; teamId: string; totalScore: number }[];
};

export type JudgeAssignmentResult = {
  id: string;
  tournamentId: string;
  judgeId: string;
  stageId: string | null;
  createdAt: string;
};

export type UpdateTournamentInput = {
  title?: string;
  description?: string;
  rules?: string;
  registrationDeadline?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  maxTeams?: number;
  teamSizeMin?: number;
  teamSizeMax?: number;
  status?: TournamentStatus;
};

export type Stage = {
  id: string;
  tournamentId: string;
  title: string;
  description: string | null;
  orderIndex: number;
  deadlineAt: string | null;
  createdAt: string;
};

export type Team = {
  id: string;
  name: string;
  tournamentId: string;
  captainId: string;
  status: string;
  createdAt: string;
};

export type Submission = {
  id: string;
  teamId: string;
  stageId: string;
  contentUrl: string | null;
  status: 'draft' | 'submitted' | 'reviewed';
  createdAt: string;
};

export type Evaluation = {
  id: number;
  submissionId: number;
  juryId: number;
  totalScore: number;
  comment: string | null;
  createdAt: string;
};

export type LeaderboardItem = {
  id: number;
  rank: number;
  tournamentId: number;
  userId: number;
  score: number;
  wins: number;
  timeMs: number | null;
  createdAt: string;
  user: { id: number; name: string; email: string; avatarUrl: string | null };
};

export type LeaderboardResponse = {
  items: LeaderboardItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
  sort: { sortBy: string; order: string };
  cache: { key: string; hit: boolean };
};

export type Notification = {
  id: string;
  recipientId: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

export type NotificationsListResponse = {
  recipientId: string;
  notifications: Notification[];
};

// ─── Profile type ─────────────────────────────────────────────────────────────

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  username?: string | null;
  bio?: string | null;
  age?: number | null;
  skills?: string | null;
  company?: string | null;
  socialLinks?: Record<string, string> | null;
};

export type UserSearchResult = {
  id: string;
  email: string;
  username: string | null;
  name: string;
  avatarUrl: string | null;
};

export type TeamSubmissionResponse = {
  submission: {
    id: string;
    teamId: string;
    roundId: string;
    githubUrl: string | null;
    videoUrl: string | null;
    liveDemoUrl: string | null;
    description: string | null;
    status: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  } | null;
  deadlineAt: string | null;
  locked: boolean;
};

export type Criterion = {
  id: string;
  tournamentId: string | null;
  roundId: string | null;
  parentId: string | null;
  title: string;
  description: string | null;
  maxScore: number;
  weight: number;
};

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export const authApi = {
  socialAuthUrl: (provider: 'google' | 'github') =>
    `${API_BASE}/auth/${provider}`,

  register: (data: { email: string; password: string; name: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: (token: string) =>
    request<AuthUser>('/auth/me', { token }),

  updateProfile: (
    data: {
      name?: string;
      avatarUrl?: string;
      username?: string;
      bio?: string;
      age?: number;
      skills?: string;
      company?: string;
      socialLinks?: Record<string, string>;
    },
    token: string,
  ) =>
    request<UserProfile>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    }),

  uploadAvatar: (file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/auth/profile/avatar`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new ApiError(res.status, body.message ?? `Failed to upload avatar`, body);
      }
      const data = await res.json() as { avatarUrl: string };
      // If the response contains a relative path, prepend the API base (without /api)
      const baseUrl = API_BASE.replace(/\/api\/?$/, '');
      const fullUrl = data.avatarUrl.startsWith('http') 
        ? data.avatarUrl 
        : `${baseUrl}${data.avatarUrl}`;
      return { avatarUrl: fullUrl };
    });
  },

  getProfile: (token: string) =>
    request<UserProfile>('/auth/profile', { token }),
};

export type MyTournament = {
  tournamentId: string;
  title: string;
  status: TournamentStatus | null;
  startsAt: string | null;
  endsAt: string | null;
  registrationDeadline: string | null;
  roles: ('captain' | 'member' | 'organizer' | 'judge')[];
  teams: { id: string; name: string; isCaptain: boolean }[];
  judgeStages: { id: string | null; title: string | null }[];
};

export const usersApi = {
  search: (q: string, token: string, limit = 10) => {
    const params = new URLSearchParams({ q, limit: String(limit) });
    return request<UserSearchResult[]>(`/users/search?${params.toString()}`, { token });
  },
  myTournaments: (token: string) =>
    request<MyTournament[]>(`/users/me/tournaments`, { token }),
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  status: string | null;
  createdAt: string | null;
  roles: { id: string; name: string }[];
};

export type AdminRole = { id: string; name: string; description: string | null };

export type TournamentEvent = {
  id: string;
  tournamentId: string;
  roundId: string | null;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  createdAt: string | null;
  tournament: { id: string; title: string } | null;
  round: { id: string; title: string } | null;
};

export const scheduleApi = {
  listGlobal: (
    params: { from?: string; to?: string; limit?: number } = {},
    token?: string | null,
  ) => {
    const q = new URLSearchParams();
    if (params.from) q.set('from', params.from);
    if (params.to) q.set('to', params.to);
    if (params.limit) q.set('limit', String(params.limit));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request<TournamentEvent[]>(`/schedule${qs}`, { token });
  },
  listForTournament: (tournamentId: string, token?: string | null) =>
    request<TournamentEvent[]>(`/tournaments/${tournamentId}/schedule`, { token }),
  create: (
    tournamentId: string,
    data: {
      title: string;
      description?: string;
      startsAt: string;
      endsAt?: string;
      location?: string;
      roundId?: number;
    },
    token: string,
  ) =>
    request<TournamentEvent>(`/tournaments/${tournamentId}/schedule`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
  update: (
    eventId: string,
    data: Partial<{
      title: string;
      description: string;
      startsAt: string;
      endsAt: string | null;
      location: string;
      roundId: number | null;
    }>,
    token: string,
  ) =>
    request<TournamentEvent>(`/schedule/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    }),
  remove: (eventId: string, token: string) =>
    request<{ ok: boolean }>(`/schedule/${eventId}`, { method: 'DELETE', token }),
};

export type SearchResponse = {
  tournaments: {
    id: string;
    title: string;
    description: string | null;
    status: TournamentStatus | null;
    createdAt: string | null;
  }[];
  topics: {
    id: string;
    title: string;
    tags: string[];
    category: { id: number; title: string } | null;
    author: { id: number; name: string } | null;
  }[];
  users: {
    id: string;
    email: string;
    username: string | null;
    name: string;
    avatarUrl: string | null;
  }[];
};

export const searchApi = {
  search: (q: string, type: 'all' | 'tournaments' | 'topics' | 'users' = 'all', limit = 10) => {
    const params = new URLSearchParams({ q, type, limit: String(limit) });
    return request<SearchResponse>(`/search?${params.toString()}`);
  },
};

export const certificatesApi = {
  teamCertificateUrl: (tournamentId: string, teamId: string) =>
    `${API_BASE}/tournaments/${tournamentId}/certificates/teams/${teamId}`,
};

export const exportApi = {
  /** Returns a URL the browser can download (CSV stream). Token passed as Bearer via fetch. */
  teamLeaderboardUrl: (tournamentId: string) =>
    `${API_BASE}/tournaments/${tournamentId}/export/teams`,
  submissionsUrl: (tournamentId: string) =>
    `${API_BASE}/tournaments/${tournamentId}/export/submissions`,
  /** Triggers an authenticated CSV download (since <a download> can't carry headers). */
  async download(url: string, filename: string, token: string) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new ApiError(res.status, `Export failed: ${res.status}`, text);
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  },
};

export type AdminStats = {
  users: number;
  tournaments: number;
  tournamentsByStatus: Record<string, number>;
  teams: number;
  submissions: number;
  evaluations: number;
  announcements: number;
  forumTopics: number;
  forumPosts: number;
  openReports: number;
};

export const adminApi = {
  stats: (token: string) =>
    request<AdminStats>(`/users/admin/stats`, { token }),
  listUsers: (token: string, q?: string, limit = 100) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (q) params.set('q', q);
    return request<AdminUser[]>(`/users?${params.toString()}`, { token });
  },
  listRoles: (token: string) =>
    request<AdminRole[]>(`/users/roles/all`, { token }),
  assignRole: (userId: string, roleName: string, token: string) =>
    request<{ ok: boolean }>(`/users/${userId}/roles/by-name`, {
      method: 'POST',
      body: JSON.stringify({ roleName }),
      token,
    }),
  revokeRole: (userId: string, roleName: string, token: string) =>
    request<{ ok: boolean }>(`/users/${userId}/roles/by-name/${encodeURIComponent(roleName)}`, {
      method: 'DELETE',
      token,
    }),
};

// ─── Tournaments endpoints ────────────────────────────────────────────────────

export const tournamentsApi = {
  list: (status?: TournamentStatus, token?: string | null) =>
    request<Tournament[]>(`/tournaments${status ? `?status=${status}` : ''}`, { token }),

  getById: (id: string | number, token?: string | null) =>
    request<Tournament>(`/tournaments/${id}`, { token }),

  getRounds: (id: string | number, token?: string | null) =>
    request<Stage[]>(`/tournaments/${id}/rounds`, { token }),

  getTeams: (id: string | number, token?: string | null) =>
    request<Team[]>(`/tournaments/${id}/teams`, { token }),

  create: (
    data: {
      title: string;
      description?: string;
      registrationDeadline?: string;
      startsAt?: string;
      endsAt?: string;
    },
    token: string,
  ) =>
    request<Tournament>('/tournaments', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  publish: (tournamentId: string, token: string) =>
    request<Tournament>('/tournaments/publish', {
      method: 'PUT',
      body: JSON.stringify({ tournamentId }),
      token,
    }),

  getLeaderboard: (
    id: string | number,
    params?: { page?: number; limit?: number; sortBy?: string; order?: string },
    token?: string | null,
  ) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.sortBy) q.set('sortBy', params.sortBy);
    if (params?.order) q.set('order', params.order);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request<LeaderboardResponse>(`/tournaments/${id}/leaderboard${qs}`, { token });
  },

  getTeamLeaderboard: (id: string | number, token?: string | null, roundId?: string | number) => {
    const qs = roundId ? `?roundId=${roundId}` : '';
    return request<TeamLeaderboardResponse>(
      `/tournaments/${id}/leaderboard/teams${qs}`,
      { token },
    );
  },
};

// ─── Teams endpoints ──────────────────────────────────────────────────────────

export type TeamMemberInput = { fullName: string; email: string };

export type TeamRegisterInput = {
  tournamentId: string;
  name: string;
  members?: TeamMemberInput[];
  captainId?: string;
  captainEmail?: string;
};

export const teamsApi = {
  register: (data: TeamRegisterInput, token: string) =>
    request<Team>('/teams/register', {
      method: 'POST',
      body: JSON.stringify({ ...data, members: data.members ?? [] }),
      token,
    }),
};

// ─── Submissions endpoints ────────────────────────────────────────────────────

export const submissionsApi = {
  create: (
    data: {
      roundId: string;
      teamId: string;
      githubUrl: string;
      videoUrl?: string;
      liveDemoUrl?: string;
      description?: string;
    },
    token: string,
  ) =>
    request<Submission>('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getById: (id: string | number, token: string) =>
    request<Submission>(`/submissions/${id}`, { token }),

  getForTeam: (teamId: string, roundId: string, token: string) => {
    const q = new URLSearchParams({ teamId, roundId });
    return request<TeamSubmissionResponse>(`/submissions/team?${q.toString()}`, { token });
  },
};

export const criteriaApi = {
  list: (tournamentId: string, token?: string | null) =>
    request<Criterion[]>(`/tournaments/${tournamentId}/criteria`, { token }),
  create: (
    tournamentId: string,
    data: {
      title: string;
      description?: string;
      maxScore?: number;
      weight?: number;
      roundId?: number;
      parentId?: number;
    },
    token: string,
  ) =>
    request<Criterion>(`/tournaments/${tournamentId}/criteria`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
  update: (
    tournamentId: string,
    criterionId: string,
    data: Partial<{
      title: string;
      description: string;
      maxScore: number;
      weight: number;
      roundId: number | null;
    }>,
    token: string,
  ) =>
    request<Criterion>(`/tournaments/${tournamentId}/criteria/${criterionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    }),
  remove: (tournamentId: string, criterionId: string, token: string) =>
    request<{ ok: boolean }>(`/tournaments/${tournamentId}/criteria/${criterionId}`, {
      method: 'DELETE',
      token,
    }),
};

// ─── Evaluations endpoints ────────────────────────────────────────────────────

export type CriterionScore = { criterionId: number; score: number };

export const evaluationsApi = {
  score: (
    data: {
      submissionId: string;
      score?: number;
      criteria?: CriterionScore[];
      comment?: string;
    },
    token: string,
  ) =>
    request<Evaluation>('/judges/score', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
};

export const judgesApi = {
  listAssignedSubmissions: (token: string) =>
    request<SubmissionForJudge[]>('/judges/submissions', { token }),
  assign: (
    data: { tournamentId: string; judgeId: string; stageId?: string | null },
    token: string,
  ) =>
    request<JudgeAssignmentResult>('/judges/assign', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
};

export const announcementsApi = {
  list: (tournamentId: string, token?: string | null) =>
    request<Announcement[]>(`/announcements/tournament/${tournamentId}`, { token }),
  create: (
    data: { tournamentId: string; title: string; body: string },
    token: string,
  ) =>
    request<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
};

export const tournamentManagementApi = {
  update: (id: string, data: UpdateTournamentInput, token: string) =>
    request<Tournament>(`/tournaments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    }),
  finish: (id: string, token: string) =>
    request<FinishEvaluationResult>(`/tournaments/${id}/finish`, {
      method: 'POST',
      token,
    }),
};

// ─── Notifications endpoints ──────────────────────────────────────────────────

export const notificationsApi = {
  list: (recipientId: string, token: string) =>
    request<NotificationsListResponse>(`/notifications/in-app/${recipientId}`, { token }),

  markRead: (notificationId: string, token: string) =>
    request<{ status: string; notificationId: string; isRead: boolean }>(
      `/notifications/in-app/${notificationId}/read`,
      { method: 'PATCH', token },
    ),
};

// ─── Forum types ──────────────────────────────────────────────────────────────

export type ForumCategory = {
  id: number;
  title: string;
  topicsCount: number;
};

export type ForumAuthor = {
  id: number;
  name: string;
  avatarUrl: string | null;
};

export type ForumTopicListItem = {
  id: number;
  title: string;
  tags: string[];
  createdAt: string;
  author: ForumAuthor | null;
  category: { id: number; title: string } | null;
  postsCount: number;
};

export type ForumTopicDetail = ForumTopicListItem;

export type ForumPost = {
  id: number;
  topicId: number;
  parentId: number | null;
  content: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  author: ForumAuthor | null;
  score: number;
  upvotes: number;
  downvotes: number;
  myVote: 1 | -1 | null;
  childrenCount: number;
};

export type ForumVoteResult = {
  postId: number;
  upvotes: number;
  downvotes: number;
  score: number;
  myVote: 1 | -1 | null;
};

export type ForumReport = {
  id: number;
  status: string;
  reason: string;
  createdAt: string | null;
  resolvedAt: string | null;
  reporter: { id: number; name: string; email: string } | null;
  post: { id: number; topicId: number; content: string | null } | null;
  topic: { id: number; title: string } | null;
};

export type ForumTopicsResponse = {
  items: ForumTopicListItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type ForumPostsResponse = {
  items: ForumPost[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

// ─── Forum endpoints ──────────────────────────────────────────────────────────

export const forumApi = {
  listCategories: () =>
    request<ForumCategory[]>('/forums/categories'),

  listTopics: (params?: { page?: number; limit?: number; search?: string; categoryId?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.search) q.set('search', params.search);
    if (params?.categoryId) q.set('categoryId', String(params.categoryId));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request<ForumTopicsResponse>(`/forums/topics${qs}`);
  },

  getTopic: (id: number | string) =>
    request<ForumTopicDetail>(`/forums/topics/${id}`),

  createTopic: (
    data: { categoryId: number; title: string; content: string; tags?: string[] },
    token: string,
  ) =>
    request<ForumTopicDetail>('/forums/topics', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  listPosts: (
    topicId: number | string,
    params?: { page?: number; limit?: number },
    token?: string | null,
  ) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request<ForumPostsResponse>(`/forums/topics/${topicId}/posts${qs}`, { token });
  },

  createPost: (
    topicId: number | string,
    data: { content: string; parentId?: number },
    token: string,
  ) =>
    request<ForumPost>(`/forums/topics/${topicId}/posts`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  deletePost: (postId: number | string, token: string) =>
    request<void>(`/forums/posts/${postId}`, {
      method: 'DELETE',
      token,
    }),

  votePost: (postId: number | string, value: 1 | -1 | 0, token: string) =>
    request<ForumVoteResult>(`/forums/posts/${postId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ value }),
      token,
    }),

  reportPost: (postId: number | string, reason: string, token: string) =>
    request<{ id: number; status: string }>(`/forums/posts/${postId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
      token,
    }),

  reportTopic: (topicId: number | string, reason: string, token: string) =>
    request<{ id: number; status: string }>(`/forums/topics/${topicId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
      token,
    }),

  listReports: (
    token: string,
    status: 'open' | 'resolved' | 'all' = 'open',
  ) =>
    request<ForumReport[]>(`/forums/reports?status=${status}`, { token }),

  resolveReport: (reportId: number | string, token: string) =>
    request<{ id: number; status: string }>(`/forums/reports/${reportId}/resolve`, {
      method: 'POST',
      token,
    }),
};

// ─── Consultation types ───────────────────────────────────────────────────────

export type ConsultationStatus = 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED';

export type Consultation = {
  id: string;
  title: string;
  description: string | null;
  status: ConsultationStatus;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  roomId: string | null;
  createdById: string;
  tournament_id: number;
  createdAt: string;
  updatedAt: string;
  participants: { id: string; userId: string; role: string }[];
};

// ─── Consultations endpoints ──────────────────────────────────────────────────

export const consultationsApi = {
  list: (token: string) =>
    request<Consultation[]>('/consultations', { token }),

  getById: (id: string, token: string) =>
    request<Consultation>(`/consultations/${id}`, { token }),

  create: (
    data: {
      title: string;
      description?: string;
      scheduledAt?: string;
      tournament_id: number;
      participantIds?: string[];
    },
    token: string,
  ) =>
    request<Consultation>('/consultations', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  start: (consultationId: string, token: string) =>
    request<Consultation>('/consultations/start', {
      method: 'POST',
      body: JSON.stringify({ consultationId }),
      token,
    }),

  join: (consultationId: string, token: string) =>
    request<{ id: string; userId: string; role: string }>('/consultations/join', {
      method: 'POST',
      body: JSON.stringify({ consultationId }),
      token,
    }),

  end: (consultationId: string, token: string) =>
    request<Consultation>('/consultations/end', {
      method: 'POST',
      body: JSON.stringify({ consultationId }),
      token,
    }),

  leave: (consultationId: string, token: string) =>
    request<{ id: string; userId: string; leftAt: string | null } | null>('/consultations/leave', {
      method: 'POST',
      body: JSON.stringify({ consultationId }),
      token,
    }),
};

// ─── Judge endpoints ──────────────────────────────────────────────────────────

export type SubmissionForJudge = {
  id: string;
  teamId: string;
  teamName: string;
  stageId: string;
  stageName: string;
  tournamentId: string;
  tournamentTitle: string;
  githubUrl: string | null;
  videoUrl: string | null;
  liveDemoUrl: string | null;
  description: string | null;
  status: string;
  createdAt: string;
  evaluation: { id: number; totalScore: number; comment: string | null } | null;
};

export type SubmissionForJudgeDetail = SubmissionForJudge & {
  tournamentStatus: string | null;
  evaluation:
    | (NonNullable<SubmissionForJudge["evaluation"]> & {
        scores: { criterionId: string | null; score: number }[];
      })
    | null;
};

export const judgeApi = {
  listSubmissions: (token: string) =>
    request<SubmissionForJudge[]>('/judges/submissions', { token }),

  getSubmission: (id: string, token: string) =>
    request<SubmissionForJudgeDetail>(`/judges/submissions/${id}`, { token }),

  score: (
    data: {
      submissionId: string;
      score?: number;
      criteria?: { criterionId: number; score: number }[];
      comment?: string;
    },
    token: string,
  ) =>
    request<Evaluation>('/judges/score', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
};
