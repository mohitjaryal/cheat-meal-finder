"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ClipboardList,
  Compass,
  Flag,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import DiscoveryNavbar from "@/components/discovery/DiscoveryNavbar";
import DiscoveryFooter from "@/components/discovery/DiscoveryFooter";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
const SESSION_TOKEN_KEY = "cmf_access_token";

type AdminUser = {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
};

type FlaggedReview = {
  review_id: number;
  dish_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  is_flagged: boolean;
};

type ModerationLog = {
  log_id: number;
  admin_id: number;
  review_id: number;
  reason: string;
  created_at: string;
};

type AdminData = {
  users: AdminUser[];
  reviews: FlaggedReview[];
  logs: ModerationLog[];
};

type PageState =
  | { status: "loading" }
  | { status: "signed-out"; message: string }
  | { status: "forbidden" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AdminData };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUser(value: unknown): value is AdminUser {
  return (
    isRecord(value) &&
    typeof value.user_id === "number" &&
    typeof value.full_name === "string" &&
    typeof value.email === "string" &&
    typeof value.role === "string" &&
    typeof value.created_at === "string"
  );
}

function isReview(value: unknown): value is FlaggedReview {
  return (
    isRecord(value) &&
    typeof value.review_id === "number" &&
    typeof value.dish_id === "number" &&
    typeof value.user_id === "number" &&
    typeof value.rating === "number" &&
    (typeof value.comment === "string" || value.comment === null) &&
    typeof value.created_at === "string" &&
    typeof value.is_flagged === "boolean"
  );
}

function isLog(value: unknown): value is ModerationLog {
  return (
    isRecord(value) &&
    typeof value.log_id === "number" &&
    typeof value.admin_id === "number" &&
    typeof value.review_id === "number" &&
    typeof value.reason === "string" &&
    typeof value.created_at === "string"
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminPage() {
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let disposed = false;
    let requestId = 0;
    let controller: AbortController | null = null;
    let activeToken: string | null = null;
    let expiresAt: number | null = null;
    let inFlight = false;

    function readToken(): string | null {
      return window.sessionStorage.getItem(SESSION_TOKEN_KEY);
    }

    function tokenExpiry(token: string): number | null {
      try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = payload.padEnd(
          payload.length + ((4 - (payload.length % 4)) % 4),
          "="
        );
        const parsed: unknown = JSON.parse(window.atob(padded));

        if (
          !isRecord(parsed) ||
          typeof parsed.exp !== "number" ||
          !Number.isFinite(parsed.exp)
        ) {
          return null;
        }

        const milliseconds = parsed.exp * 1000;
        return Number.isFinite(milliseconds) ? milliseconds : null;
      } catch {
        return null;
      }
    }

    function cancelRequest() {
      requestId += 1;
      controller?.abort();
      controller = null;
      inFlight = false;
    }

    function clearSessionView(next: PageState) {
      cancelRequest();
      activeToken = null;
      expiresAt = null;
      if (!disposed) setState(next);
    }

    async function loadAdminData() {
      if (disposed || document.visibilityState !== "visible" || inFlight) {
        return;
      }

      let token: string | null;

      try {
        token = readToken();
      } catch {
        clearSessionView({
          status: "error",
          message: "Your browser could not access this session.",
        });
        return;
      }

      if (!token) {
        clearSessionView({
          status: "signed-out",
          message: "Log in with an admin account to continue.",
        });
        return;
      }

      const expiry = tokenExpiry(token);

      if (expiry === null || expiry <= Date.now()) {
        clearSessionView({
          status: "signed-out",
          message: "Your session is invalid or expired. Please log in again.",
        });
        return;
      }

      if (!API_URL) {
        clearSessionView({
          status: "error",
          message: "The API URL is not configured.",
        });
        return;
      }

      cancelRequest();
      const currentRequest = requestId;
      const currentController = new AbortController();
      controller = currentController;
      inFlight = true;
      activeToken = token;
      expiresAt = expiry;
      setState({ status: "loading" });

      function stillCurrent(): boolean {
        return (
          !disposed &&
          !currentController.signal.aborted &&
          currentRequest === requestId &&
          document.visibilityState === "visible"
        );
      }

      function sessionStillValid(): boolean {
        return readToken() === token && expiry !== null && expiry > Date.now();
      }

      try {
        const options: RequestInit = {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: currentController.signal,
        };

        const responses = await Promise.all([
          fetch(`${API_URL}/admin/users`, options),
          fetch(`${API_URL}/admin/flagged-reviews`, options),
          fetch(`${API_URL}/admin/moderation-logs`, options),
        ]);

        if (!stillCurrent()) return;

        if (!sessionStillValid()) {
          clearSessionView({
            status: "signed-out",
            message: "Your session changed or expired. Please log in again.",
          });
          return;
        }

        if (responses.some((response) => response.status === 401)) {
          clearSessionView({
            status: "signed-out",
            message: "Your session is invalid or expired. Please log in again.",
          });
          return;
        }

        if (responses.some((response) => response.status === 403)) {
          clearSessionView({ status: "forbidden" });
          return;
        }

        if (responses.some((response) => !response.ok)) {
          clearSessionView({
            status: "error",
            message: "We couldn't load the admin data. Please try again.",
          });
          return;
        }

        const [users, reviews, logs]: unknown[] = await Promise.all(
          responses.map((response) => response.json())
        );

        if (!stillCurrent()) return;

        if (!sessionStillValid()) {
          clearSessionView({
            status: "signed-out",
            message: "Your session changed or expired. Please log in again.",
          });
          return;
        }

        if (
          !Array.isArray(users) ||
          !users.every(isUser) ||
          !Array.isArray(reviews) ||
          !reviews.every(isReview) ||
          !Array.isArray(logs) ||
          !logs.every(isLog)
        ) {
          clearSessionView({
            status: "error",
            message: "The admin service returned an unexpected response.",
          });
          return;
        }

        setState({
          status: "ready",
          data: { users, reviews, logs },
        });
      } catch {
        if (!stillCurrent()) return;

        clearSessionView({
          status: "error",
          message: "Could not connect to the admin service. Please try again.",
        });
      } finally {
        if (currentRequest === requestId) {
          controller = null;
          inFlight = false;
        }
      }
    }

    function checkSession() {
      if (disposed || !activeToken) return;

      try {
        if (readToken() !== activeToken) {
          clearSessionView({
            status: "signed-out",
            message: "Your session changed. Please log in again.",
          });
        } else if (expiresAt === null || expiresAt <= Date.now()) {
          clearSessionView({
            status: "signed-out",
            message: "Your session is invalid or expired. Please log in again.",
          });
        }
      } catch {
        clearSessionView({
          status: "error",
          message: "Your browser could not access this session.",
        });
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        clearSessionView({ status: "loading" });
      } else {
        void loadAdminData();
      }
    }

    function handleFocus() {
      if (document.visibilityState === "visible") {
        void loadAdminData();
      }
    }

    const interval = window.setInterval(checkSession, 1000);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    void loadAdminData();

    return () => {
      disposed = true;
      cancelRequest();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [attempt]);
  function retry() {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  }

  return (
    <div className="cmf-admin-workspace">
      <DiscoveryNavbar />

      <main className="cmf-admin-main">
        <div className="cmf-admin-shell">
          <div className="cmf-admin-topline">
            <Link href="/dashboard" className="cmf-admin-back">
              <ArrowLeft size={16} aria-hidden="true" />
              Back to account
            </Link>

            <span className="cmf-admin-top-label">
              CHEAT MEAL FINDER <span aria-hidden="true">/</span> ADMIN
            </span>
          </div>

          {state.status !== "ready" && (
            <section
              className="cmf-admin-access"
              aria-labelledby="admin-access-title"
            >
              <div className="cmf-admin-access-intro">
                <span className="cmf-admin-section-label">
                  <Sparkles size={15} aria-hidden="true" />
                  YOUR WORKSPACE
                </span>

                <h2 id="admin-access-title">Made for a closer look.</h2>

                <p>
                  Admin information is available only to accounts authorized
                  by the backend.
                </p>

                <div className="cmf-admin-access-footnote">
                  <ShieldCheck size={17} aria-hidden="true" />
                  Access is checked by the admin service.
                </div>
              </div>

              <div className="cmf-admin-access-panel">
                <div className="cmf-admin-access-icon" aria-hidden="true">
                  {state.status === "loading" ? (
                    <Compass size={24} />
                  ) : state.status === "error" ? (
                    <RefreshCw size={23} />
                  ) : (
                    <LockKeyhole size={23} />
                  )}
                </div>

                {state.status === "loading" && (
                  <div role="status">
                    <span className="cmf-admin-panel-kicker">ONE MOMENT</span>
                    <h3>Checking your access</h3>
                    <p>Connecting to the admin service...</p>
                  </div>
                )}

                {state.status === "signed-out" && (
                  <div>
                    <span className="cmf-admin-panel-kicker">WELCOME BACK</span>
                    <h3>Log in to continue</h3>
                    <p role="status">{state.message}</p>

                    <Link href="/login?from=admin" className="cmf-admin-primary">
                      Go to login
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  </div>
                )}

                {state.status === "forbidden" && (
                  <div>
                    <span className="cmf-admin-panel-kicker">
                      ACCESS RESTRICTED
                    </span>
                    <h3>Admin access required</h3>

                    <p role="alert">
                      This account does not have permission to access admin data.
                    </p>

                    <Link href="/dashboard" className="cmf-admin-primary">
                      Return to account
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  </div>
                )}

                {state.status === "error" && (
                  <div>
                    <span className="cmf-admin-panel-kicker">CONNECTION</span>
                    <h3>Unable to load workspace</h3>
                    <p role="alert">{state.message}</p>

                    <button
                      type="button"
                      onClick={retry}
                      className="cmf-admin-primary"
                    >
                      Try again
                      <RefreshCw size={16} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {state.status === "ready" && (
            <div className="cmf-admin-content">
              <div className="cmf-admin-content-heading">
                <div>
                  <span className="cmf-admin-section-label">
                    <Sparkles size={15} aria-hidden="true" />
                    WORKSPACE OVERVIEW
                  </span>
                  <h2>At a glance</h2>
                  <p>Counts reflect the lists returned by the admin service.</p>
                </div>

                <button
                  type="button"
                  onClick={retry}
                  className="cmf-admin-refresh"
                >
                  <RefreshCw size={16} aria-hidden="true" />
                  Refresh data
                </button>
              </div>

              <div className="cmf-admin-stats">
                {[
                  {
                    label: "Users",
                    caption: "Account records",
                    count: state.data.users.length,
                    icon: Users,
                  },
                  {
                    label: "Flagged reviews",
                    caption: "Currently flagged",
                    count: state.data.reviews.length,
                    icon: Flag,
                  },
                  {
                    label: "Moderation logs",
                    caption: "Recorded activity",
                    count: state.data.logs.length,
                    icon: ClipboardList,
                  },
                ].map(({ label, caption, count, icon: Icon }) => (
                  <div className="cmf-admin-stat" key={label}>
                    <div className="cmf-admin-stat-top">
                      <span className="cmf-admin-stat-icon">
                        <Icon size={21} aria-hidden="true" />
                      </span>
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </div>

                    <p className="cmf-admin-stat-count">{count}</p>
                    <h3>{label}</h3>
                    <p className="cmf-admin-stat-caption">{caption}</p>
                  </div>
                ))}
              </div>

              <section
                className="cmf-admin-section"
                aria-labelledby="admin-flagged-title"
              >
                <div className="cmf-admin-section-heading">
                  <div className="cmf-admin-section-heading-copy">
                    <span className="cmf-admin-section-icon">
                      <Flag size={20} aria-hidden="true" />
                    </span>

                    <div>
                      <span className="cmf-admin-overline">COMMUNITY CARE</span>
                      <h2 id="admin-flagged-title">Flagged reviews</h2>
                      <p>Reviews currently flagged by the backend.</p>
                    </div>
                  </div>

                  <span className="cmf-admin-count">
                    {state.data.reviews.length} returned
                  </span>
                </div>

                {state.data.reviews.length === 0 ? (
                  <div className="cmf-admin-empty">
                    <Flag size={21} aria-hidden="true" />
                    <p>No flagged reviews returned.</p>
                  </div>
                ) : (
                  <div className="cmf-admin-list">
                    {state.data.reviews.map((review) => (
                      <article className="cmf-admin-item" key={review.review_id}>
                        <div className="cmf-admin-item-top">
                          <strong>Review #{review.review_id}</strong>
                          <time dateTime={review.created_at}>
                            {formatDate(review.created_at)}
                          </time>
                        </div>

                        <p className="cmf-admin-item-meta">
                          Dish #{review.dish_id} {" · "} User #{review.user_id}
                          {" · "} Rating {review.rating}/5
                        </p>

                        <p className="cmf-admin-item-copy">
                          {review.comment?.trim() || "No written comment."}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section
                className="cmf-admin-section"
                aria-labelledby="admin-users-title"
              >
                <div className="cmf-admin-section-heading">
                  <div className="cmf-admin-section-heading-copy">
                    <span className="cmf-admin-section-icon">
                      <Users size={20} aria-hidden="true" />
                    </span>

                    <div>
                      <span className="cmf-admin-overline">ACCOUNT RECORDS</span>
                      <h2 id="admin-users-title">Users</h2>
                      <p>Accounts returned by the admin service.</p>
                    </div>
                  </div>

                  <span className="cmf-admin-count">
                    {state.data.users.length} returned
                  </span>
                </div>

                {state.data.users.length === 0 ? (
                  <div className="cmf-admin-empty">
                    <Users size={21} aria-hidden="true" />
                    <p>No users returned.</p>
                  </div>
                ) : (
                  <div
                    className="cmf-admin-table-wrap"
                    role="region"
                    aria-label="User records"
                    tabIndex={0}
                  >
                    <table className="cmf-admin-table">
                      <thead>
                        <tr>
                          <th scope="col">ID</th>
                          <th scope="col">Name</th>
                          <th scope="col">Email</th>
                          <th scope="col">Role</th>
                          <th scope="col">Joined</th>
                        </tr>
                      </thead>

                      <tbody>
                        {state.data.users.map((user) => (
                          <tr key={user.user_id}>
                            <td>{user.user_id}</td>
                            <td>{user.full_name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{formatDate(user.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section
                className="cmf-admin-section"
                aria-labelledby="admin-logs-title"
              >
                <div className="cmf-admin-section-heading">
                  <div className="cmf-admin-section-heading-copy">
                    <span className="cmf-admin-section-icon">
                      <ClipboardList size={20} aria-hidden="true" />
                    </span>

                    <div>
                      <span className="cmf-admin-overline">AUDIT TRAIL</span>
                      <h2 id="admin-logs-title">Moderation activity</h2>
                      <p>Recorded reasons and associated IDs.</p>
                    </div>
                  </div>

                  <span className="cmf-admin-count">
                    {state.data.logs.length} returned
                  </span>
                </div>

                {state.data.logs.length === 0 ? (
                  <div className="cmf-admin-empty">
                    <ClipboardList size={21} aria-hidden="true" />
                    <p>No moderation logs returned.</p>
                  </div>
                ) : (
                  <div className="cmf-admin-list">
                    {state.data.logs.map((log) => (
                      <article className="cmf-admin-item" key={log.log_id}>
                        <div className="cmf-admin-item-top">
                          <strong>Log #{log.log_id}</strong>
                          <time dateTime={log.created_at}>
                            {formatDate(log.created_at)}
                          </time>
                        </div>

                        <p className="cmf-admin-item-meta">
                          Admin #{log.admin_id} {" · "} Review #{log.review_id}
                        </p>

                        <p className="cmf-admin-item-copy">{log.reason}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          <header className="cmf-admin-hero">
            <div className="cmf-admin-hero-copy">
              <span className="cmf-admin-eyebrow">
                <ShieldCheck size={16} aria-hidden="true" />
                ADMIN WORKSPACE
              </span>

              <h1>
                A clearer view of <em>your community.</em>
              </h1>

              <p>
                A dedicated space for account records, flagged reviews, and
                moderation activity.
              </p>

              <div className="cmf-admin-hero-meta">
                <span>
                  <span className="cmf-admin-meta-dot" aria-hidden="true" />
                  READ-ONLY WORKSPACE
                </span>
                <span className="cmf-admin-meta-divider" aria-hidden="true" />
                <span>COMMUNITY OPERATIONS</span>
              </div>
            </div>

            <div className="cmf-admin-hero-art" aria-hidden="true">
              <div className="cmf-admin-orbit cmf-admin-orbit-outer" />
              <div className="cmf-admin-orbit cmf-admin-orbit-inner" />

              <div className="cmf-admin-art-core">
                <ShieldCheck size={48} strokeWidth={1.3} />
              </div>

              <div className="cmf-admin-art-badge cmf-admin-art-badge-one">
                <Users size={18} />
              </div>

              <div className="cmf-admin-art-badge cmf-admin-art-badge-two">
                <Flag size={18} />
              </div>

              <span className="cmf-admin-art-caption">
                A THOUGHTFUL OVERVIEW
              </span>
            </div>
          </header>
        </div>
      </main>

      <DiscoveryFooter />
    </div>
  );
}