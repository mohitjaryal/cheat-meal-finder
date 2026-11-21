"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Hash,
  LogOut,
  Mail,
  MapPin,
  Shield,
  Sparkles,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";
import DiscoveryNavbar from "@/components/discovery/DiscoveryNavbar";
import DiscoveryFooter from "@/components/discovery/DiscoveryFooter";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
const SESSION_TOKEN_KEY = "cmf_access_token";

type Profile = {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
};

type ProfileState =
  | { status: "loading" }
  | { status: "ready"; profile: Profile }
  | { status: "signed-out"; message: string }
  | { status: "error"; message: string };

function isProfile(value: unknown): value is Profile {
  if (typeof value !== "object" || value === null) return false;

  const profile = value as Record<string, unknown>;

  return (
    typeof profile.user_id === "number" &&
    Number.isSafeInteger(profile.user_id) &&
    profile.user_id > 0 &&
    typeof profile.full_name === "string" &&
    profile.full_name.trim().length > 0 &&
    typeof profile.email === "string" &&
    profile.email.trim().length > 0 &&
    typeof profile.role === "string" &&
    profile.role.trim().length > 0
  );
}

export default function DashboardPage() {
  const [state, setState] = useState<ProfileState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    if (signedOut) return;

    const controller = new AbortController();

    async function loadProfile() {
      let token: string | null;

      try {
        token = window.sessionStorage.getItem(SESSION_TOKEN_KEY);
      } catch {
        setState({
          status: "error",
          message: "Your browser could not access this session.",
        });
        return;
      }

      if (!token) {
        setState({
          status: "signed-out",
          message: "Please log in to view your profile.",
        });
        return;
      }

      if (!API_URL) {
        setState({
          status: "error",
          message: "The API URL is not configured.",
        });
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (response.status === 401) {
          try {
            if (window.sessionStorage.getItem(SESSION_TOKEN_KEY) === token) {
              window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
            }
          } catch {
            // Do not show profile data when the session is unauthorized.
          }

          setState({
            status: "signed-out",
            message: "Your session is invalid or expired. Please log in again.",
          });
          return;
        }

        if (!response.ok) {
          setState({
            status: "error",
            message: "We couldn't load your profile. Please try again.",
          });
          return;
        }

        const data: unknown = await response.json();

        if (controller.signal.aborted) return;

        if (!isProfile(data)) {
          setState({
            status: "error",
            message: "The profile response was invalid. Please try again later.",
          });
          return;
        }

        setState({ status: "ready", profile: data });
      } catch {
        if (controller.signal.aborted) return;

        setState({
          status: "error",
          message: "Could not connect to the profile service. Please try again.",
        });
      }
    }

    void loadProfile();
    return () => controller.abort();
  }, [attempt, signedOut]);

  function handleRetry() {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  }

  function handleLogout() {
    try {
      window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
      setSignedOut(true);
      setState({
        status: "signed-out",
        message: "You have been logged out on this tab.",
      });
    } catch {
      setState({
        status: "error",
        message: "Could not clear the session. Please check your browser settings.",
      });
    }
  }

  return (
    <div className="cmf-profile-page">
      <DiscoveryNavbar accountStatus={state.status === "ready" ? "verified" : state.status === "signed-out" ? "signed-out" : "unknown"} />

      <main className="cmf-profile-main">
        <Link href="/" className="cmf-profile-back">
          <ArrowLeft size={17} aria-hidden="true" />
          Back to discover
        </Link>

        <div className="cmf-profile-content">
          {state.status === "loading" && (
            <section className="cmf-profile-state" aria-live="polite">
              <div className="cmf-profile-state-icon">
                <Compass size={24} aria-hidden="true" />
              </div>
              <h2>Finding your profile</h2>
              <p role="status">Loading your account details...</p>
            </section>
          )}

          {state.status === "signed-out" && (
            <section className="cmf-profile-state cmf-profile-signed-out">
              <div className="cmf-profile-state-icon">
                <UserRound size={24} aria-hidden="true" />
              </div>
              <h2>Your profile awaits</h2>
              <p role="status">{state.message}</p>
              <Link href="/login" className="cmf-profile-button">
                Go to login
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </section>
          )}

          {state.status === "error" && (
            <section className="cmf-profile-state">
              <div className="cmf-profile-state-icon">
                <Compass size={24} aria-hidden="true" />
              </div>
              <h2>Something went wrong</h2>
              <p role="alert">{state.message}</p>
              <div className="cmf-profile-actions">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="cmf-profile-button"
                >
                  Try again
                </button>
                <Link href="/login" className="cmf-profile-button-secondary">
                  Go to login
                </Link>
              </div>
            </section>
          )}

          {state.status === "ready" && (
            <div className="cmf-profile-grid">
              <section className="cmf-profile-identity">
                <div className="cmf-profile-identity-top">
                  <span className="cmf-profile-identity-label">
                    <span aria-hidden="true" />
                    ACCOUNT OVERVIEW
                  </span>
                  <Sparkles size={19} aria-hidden="true" />
                </div>

                <div className="cmf-profile-avatar" aria-hidden="true">
                  <UserRound size={34} strokeWidth={1.5} />
                </div>

                <p className="cmf-profile-identity-kicker">WELCOME BACK</p>
                <h2>{state.profile.full_name}</h2>
                <p className="cmf-profile-identity-description">
                  Your personal corner for discovering something delicious.
                </p>

                <div className="cmf-profile-identity-bottom">
                  <div>
                    <p className="cmf-profile-identity-note">PROFILE DETAILS</p>
                    <p className="cmf-profile-readonly">Currently read-only</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="cmf-profile-logout"
                  >
                    <LogOut size={17} aria-hidden="true" />
                    Log out
                  </button>
                </div>
              </section>

              <section
                className="cmf-profile-details"
                aria-labelledby="account-details-title"
              >
                <div className="cmf-profile-details-heading">
                  <div>
                    <p className="cmf-profile-section-kicker">THE ESSENTIALS</p>
                    <h2 id="account-details-title">Account details</h2>
                    <p>Information connected to your account.</p>
                  </div>
                  <span className="cmf-profile-heading-icon" aria-hidden="true">
                    <UserRound size={21} />
                  </span>
                </div>

                <dl className="cmf-profile-detail-grid">
                  <div className="cmf-profile-detail cmf-profile-detail-email">
                    <div className="cmf-profile-detail-icon">
                      <Mail size={20} aria-hidden="true" />
                    </div>
                    <div className="cmf-profile-detail-text">
                      <dt>Email address</dt>
                      <dd className="cmf-profile-email">{state.profile.email}</dd>
                    </div>
                  </div>

                  <div className="cmf-profile-detail">
                    <div className="cmf-profile-detail-icon">
                      <Shield size={20} aria-hidden="true" />
                    </div>
                    <div className="cmf-profile-detail-text">
                      <dt>Account role</dt>
                      <dd>{state.profile.role}</dd>
                    </div>
                  </div>

                  <div className="cmf-profile-detail">
                    <div className="cmf-profile-detail-icon">
                      <Hash size={20} aria-hidden="true" />
                    </div>
                    <div className="cmf-profile-detail-text">
                      <dt>User ID</dt>
                      <dd>{state.profile.user_id}</dd>
                    </div>
                  </div>
                </dl>

                <div className="cmf-profile-explore">
                  <div className="cmf-profile-explore-copy">
                    <span className="cmf-profile-explore-icon">
                      <Compass size={21} aria-hidden="true" />
                    </span>
                    <div>
                      <p>Something delicious is waiting.</p>
                      <span>Find your next local favourite.</span>
                    </div>
                  </div>
                  <Link href="/" className="cmf-profile-explore-link">
                    Explore
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </div>
              </section>
            </div>
          )}
        </div>

        <section className="cmf-profile-hero" aria-labelledby="profile-title">
          <div className="cmf-profile-hero-copy">
            <p className="cmf-profile-eyebrow">
              <Sparkles size={14} aria-hidden="true" />
              YOUR PERSONAL SPACE
            </p>
            <h1 id="profile-title">
              Made for your <span>next craving.</span>
            </h1>
            <p className="cmf-profile-hero-description">
              Your account, your starting point, and a whole world of local
              flavours waiting to be discovered.
            </p>
            <div className="cmf-profile-hero-caption">
              <span className="cmf-profile-caption-icon">
                <Compass size={16} aria-hidden="true" />
              </span>
              CHEAT MEAL FINDER <span aria-hidden="true">/</span> YOUR PROFILE
            </div>
          </div>

          <div className="cmf-profile-art" aria-hidden="true">
            <div className="cmf-profile-art-orbit cmf-profile-art-orbit-outer" />
            <div className="cmf-profile-art-orbit cmf-profile-art-orbit-inner" />
            <div className="cmf-profile-art-cross cmf-profile-art-cross-one" />
            <div className="cmf-profile-art-cross cmf-profile-art-cross-two" />
            <div className="cmf-profile-art-core">
              <Compass size={82} strokeWidth={1.15} />
            </div>
            <div className="cmf-profile-art-badge cmf-profile-art-badge-food">
              <UtensilsCrossed size={22} strokeWidth={1.7} />
            </div>
            <div className="cmf-profile-art-badge cmf-profile-art-badge-pin">
              <MapPin size={21} strokeWidth={1.7} />
            </div>
            <span className="cmf-profile-art-label">DISCOVER YOUR WAY</span>
          </div>
        </section>

      </main>

      <DiscoveryFooter />
    </div>
  );
}