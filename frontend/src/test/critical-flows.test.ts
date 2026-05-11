import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  teamsApi,
  submissionsApi,
  judgeApi,
  tournamentsApi,
  tournamentManagementApi,
  announcementsApi,
  ApiError,
} from "@/lib/api";

type FetchCall = { url: string; init: RequestInit | undefined };
const calls: FetchCall[] = [];

type FakeResponse = { status?: number; _body?: unknown };
function mockFetch(
  responder: (input: RequestInfo | URL, init?: RequestInit) => FakeResponse,
) {
  global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    const r = responder(input, init);
    const status = r.status ?? 200;
    const body = r._body;
    return {
      ok: status >= 200 && status < 300,
      status,
      headers: new Headers({ "content-length": body == null ? "0" : "1" }),
      json: async () => body ?? {},
    } as Response;
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  calls.length = 0;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Critical flow: registration with members", () => {
  it("POSTs /teams/register with members array intact", async () => {
    mockFetch(() => ({ _body: { id: "t1", name: "X", tournamentId: "1", captainId: "u1", status: "active", createdAt: "" } }));
    await teamsApi.register(
      {
        tournamentId: "42",
        name: "FoldUpCrew",
        members: [
          { fullName: "Anna", email: "a@x.io" },
          { fullName: "Boris", email: "b@x.io" },
        ],
      },
      "tok",
    );
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toMatch(/\/teams\/register$/);
    expect(calls[0].init?.method).toBe("POST");
    const body = JSON.parse(String(calls[0].init?.body));
    expect(body.tournamentId).toBe("42");
    expect(body.members).toHaveLength(2);
    expect(body.members[0]).toEqual({ fullName: "Anna", email: "a@x.io" });
  });

  it("never silently drops members (defaults to [])", async () => {
    mockFetch(() => ({ _body: {} }));
    await teamsApi.register({ tournamentId: "1", name: "T" }, "tok");
    const body = JSON.parse(String(calls[0].init?.body));
    expect(Array.isArray(body.members)).toBe(true);
    expect(body.members).toHaveLength(0);
  });
});

describe("Critical flow: submission requires GitHub URL", () => {
  it("submits with required githubUrl", async () => {
    mockFetch(() => ({ _body: { id: "s1" } }));
    await submissionsApi.create(
      { roundId: "1", teamId: "2", githubUrl: "https://github.com/x/y" },
      "tok",
    );
    const body = JSON.parse(String(calls[0].init?.body));
    expect(body.githubUrl).toBe("https://github.com/x/y");
  });

  it("propagates 422 validation error from API", async () => {
    mockFetch(() => ({ status: 422, _body: { message: "githubUrl required" } }));
    await expect(
      submissionsApi.create({ roundId: "1", teamId: "2", githubUrl: "" }, "tok"),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe("Critical flow: judge sees only assigned submissions", () => {
  it("GETs /judges/submissions with bearer token", async () => {
    mockFetch(() => ({ _body: [] }));
    await judgeApi.listSubmissions("judge-token");
    expect(calls[0].url).toMatch(/\/judges\/submissions$/);
    const headers = calls[0].init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer judge-token");
  });
});

describe("Critical flow: leaderboard refresh", () => {
  it("re-fetches team leaderboard endpoint", async () => {
    mockFetch(() => ({ _body: { items: [], cache: { key: "k", hit: false } } }));
    await tournamentsApi.getTeamLeaderboard("7");
    expect(calls[0].url).toMatch(/\/tournaments\/7\/leaderboard\/teams$/);
  });

  it("supports legacy /leaderboard query with sorting params", async () => {
    mockFetch(() => ({ _body: { items: [], pagination: {}, sort: {}, cache: {} } }));
    await tournamentsApi.getLeaderboard("9", { page: 2, sortBy: "score", order: "desc" });
    expect(calls[0].url).toMatch(/\/tournaments\/9\/leaderboard\?.*page=2/);
    expect(calls[0].url).toMatch(/sortBy=score/);
  });
});

describe("Critical flow: finish-evaluation", () => {
  it("POSTs /tournaments/:id/finish with auth", async () => {
    mockFetch(() => ({ _body: { tournamentId: "5", status: "finished", rankings: [] } }));
    await tournamentManagementApi.finish("5", "owner-tok");
    expect(calls[0].url).toMatch(/\/tournaments\/5\/finish$/);
    expect(calls[0].init?.method).toBe("POST");
    const headers = calls[0].init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer owner-tok");
  });

  it("surfaces 403 when non-owner triggers finish", async () => {
    mockFetch(() => ({ status: 403, _body: { message: "You do not own this tournament" } }));
    await expect(tournamentManagementApi.finish("5", "x")).rejects.toMatchObject({
      status: 403,
    });
  });
});

describe("Critical flow: announcements", () => {
  it("lists announcements for tournament", async () => {
    mockFetch(() => ({ _body: [] }));
    await announcementsApi.list("11");
    expect(calls[0].url).toMatch(/\/announcements\/tournament\/11$/);
  });

  it("requires title + body on create", async () => {
    mockFetch(() => ({ _body: { id: "a1" } }));
    await announcementsApi.create(
      { tournamentId: "11", title: "Hi", body: "Body" },
      "tok",
    );
    const body = JSON.parse(String(calls[0].init?.body));
    expect(body.title).toBe("Hi");
    expect(body.body).toBe("Body");
  });
});
