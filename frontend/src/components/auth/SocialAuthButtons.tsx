"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type SocialAuthButtonsProps = {
  mode: "login" | "signup";
  className?: string;
};

type Provider = "Google" | "Apple" | "Facebook";

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.25c0-.82-.07-1.42-.23-2.05H12v3.86h5.35a4.56 4.56 0 0 1-1.98 3v2.49h3.2c1.87-1.72 2.78-4.24 2.78-7.3Z"
      />
      <path
        fill="#34A853"
        d="M12 21.7c2.67 0 4.91-.88 6.55-2.39l-3.2-2.49c-.88.59-2.01.94-3.35.94-2.57 0-4.76-1.74-5.54-4.08H3.17v2.57A9.9 9.9 0 0 0 12 21.7Z"
      />
      <path
        fill="#FBBC05"
        d="M6.46 13.69A5.94 5.94 0 0 1 6.15 12c0-.59.1-1.16.3-1.69V7.74H3.18A9.94 9.94 0 0 0 2.12 12c0 1.6.38 3.12 1.05 4.26l3.29-2.57Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.23c1.45 0 2.75.5 3.77 1.49l2.83-2.83A9.54 9.54 0 0 0 12 2.3a9.9 9.9 0 0 0-8.83 5.44l3.29 2.57c.78-2.34 2.97-4.08 5.54-4.08Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.05 12.54c.02 2.23 1.96 2.97 1.98 2.98-.02.05-.31 1.06-1.02 2.09-.61.89-1.24 1.77-2.24 1.79-.98.02-1.29-.58-2.41-.58-1.12 0-1.47.56-2.4.6-.96.04-1.69-.96-2.31-1.85-1.26-1.83-2.22-5.18-.93-7.42a3.58 3.58 0 0 1 3.03-1.85c.95-.02 1.85.65 2.43.65.58 0 1.67-.8 2.82-.68.48.02 1.82.2 2.68 1.45-.07.05-1.6.94-1.58 2.82ZM15.25 6.05c.51-.62.86-1.48.77-2.34-.74.03-1.64.49-2.17 1.11-.48.55-.9 1.42-.79 2.26.83.06 1.68-.42 2.19-1.03Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="10" fill="#1877F2" />
      <path
        fill="#FFFFFF"
        d="M13.52 20v-7.3h2.45l.37-2.85h-2.82V8.03c0-.82.23-1.39 1.41-1.39h1.51V4.09A20.12 20.12 0 0 0 14.24 4c-2.18 0-3.67 1.33-3.67 3.77v2.08H8.11v2.85h2.46V20h2.95Z"
      />
    </svg>
  );
}

const providers: {
  name: Provider;
  icon: ReactNode;
}[] = [
  { name: "Google", icon: <GoogleIcon /> },
  { name: "Apple", icon: <AppleIcon /> },
  { name: "Facebook", icon: <FacebookIcon /> },
];

export default function SocialAuthButtons({
  mode,
  className = "",
}: SocialAuthButtonsProps) {
  const [toast, setToast] = useState<Provider | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const action = mode === "signup" ? "Sign up" : "Continue";

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function showToast(provider: Provider) {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast(provider);

    timeoutRef.current = setTimeout(() => {
      setToast(null);
      timeoutRef.current = null;
    }, 3500);
  }

  const buttonStyles = `
    group
    relative
    isolate
    flex
    min-h-[52px]
    min-w-0
    w-full
    cursor-pointer
    items-center
    justify-center
    overflow-hidden
    rounded-xl
    border
    border-espresso/15
    bg-gradient-to-br
    from-[#FFFCF6]
    via-[#FFF8EC]
    to-[#F7F0E3]
    px-2
    text-xs
    font-bold
    text-espresso
    shadow-[0_3px_10px_rgba(44,26,20,0.06)]
    transition-[transform,box-shadow,border-color,background-color]
    duration-300
    ease-out
    hover:-translate-y-[3px]
    hover:border-terracotta/45
    hover:shadow-[0_10px_24px_rgba(196,90,52,0.15)]
    active:translate-y-0
    active:scale-[0.98]
    focus-visible:outline-none
    focus-visible:ring-4
    focus-visible:ring-terracotta/20
    sm:min-h-[50px]
    sm:px-3
    sm:text-sm
    motion-reduce:transform-none
    motion-reduce:transition-none
  `;

  return (
    <div className={className}>
      {/* =======================================================
          SOCIAL AUTH DIVIDER
      ======================================================== */}
      <div className="relative my-5 flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-espresso/10" />

        <span className="relative bg-[rgba(247,242,231,0.96)] px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Or continue with
        </span>
      </div>

      {/* =======================================================
          GOOGLE + APPLE + FACEBOOK
          Always three buttons in one row.
      ======================================================== */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {providers.map((provider) => (
          <button
            key={provider.name}
            type="button"
            onClick={() => showToast(provider.name)}
            aria-label={`${action} with ${provider.name} — coming soon`}
            title={`${provider.name} authentication coming soon`}
            className={buttonStyles}
          >
            {/* Premium highlight sweep */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-y-0
                -left-1/2
                w-1/3
                -skew-x-12
                bg-gradient-to-r
                from-transparent
                via-white/70
                to-transparent
                opacity-0
                transition-[left,opacity]
                duration-700
                ease-out
                group-hover:left-[130%]
                group-hover:opacity-100
                motion-reduce:hidden
              "
            />

            {/* Provider icon and label */}
            <span
              className="
                relative
                z-10
                flex
                min-w-0
                flex-col
                items-center
                justify-center
                gap-1
                transition-transform
                duration-300
                group-hover:scale-[1.04]
                sm:flex-row
                sm:gap-2
                motion-reduce:transform-none
                motion-reduce:transition-none
              "
            >
              <span className="shrink-0">
                {provider.icon}
              </span>

              <span className="whitespace-nowrap">
                {provider.name}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* =======================================================
          AVAILABILITY MESSAGE
      ======================================================== */}
      <p className="mt-3 text-center text-[10px] leading-4 text-muted">
        Google, Apple and Facebook sign-in are coming soon.
      </p>

      {/* =======================================================
          COMING SOON TOAST
          Rendered outside floating 3D cards.
      ======================================================== */}
      {toast &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className="
              fixed
              bottom-6
              left-1/2
              z-[9999]
              w-[calc(100%-2rem)]
              max-w-sm
              -translate-x-1/2
              rounded-2xl
              border
              border-terracotta/20
              bg-[#FFFAF0]
              px-5
              py-4
              text-center
              shadow-[0_16px_50px_rgba(44,26,20,0.18)]
              sm:bottom-8
            "
          >
            <p className="text-sm font-bold text-espresso">
              {toast} authentication coming soon!
            </p>

            <p className="mt-1 text-xs leading-5 text-muted">
              We&apos;re preparing this sign-in option.
              Please use email authentication for now.
            </p>
          </div>,
          document.body,
        )}
    </div>
  );
}