"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { resolvePostLoginPath, useAuth } from "@/lib/auth/AuthProvider";
import { ApiError } from "@/lib/api/types";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

type GoogleSignInButtonProps = {
  next?: string;
  onError?: (message: string) => void;
  className?: string;
};

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function GoogleSignInButton({
  next = "/dashboard",
  onError,
  className = "",
}: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;

    let cancelled = false;

    async function handleCredential(response: { credential?: string }) {
      if (!response.credential) {
        onError?.("Google sign-in failed");
        return;
      }
      setPending(true);
      try {
        const result = await loginWithGoogle(response.credential);
        const home = resolvePostLoginPath(result.user, next);
        const dest =
          result.user.role !== "admin" && result.needsPhone
            ? `/complete-profile?next=${encodeURIComponent(home)}`
            : home;
        router.replace(dest);
      } catch (err) {
        onError?.(
          err instanceof ApiError ? err.message : "Google sign-in failed"
        );
      } finally {
        setPending(false);
      }
    }

    function init() {
      if (cancelled || !window.google?.accounts?.id || !hostRef.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
      });
      hostRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(hostRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: hostRef.current.offsetWidth || 280,
      });
      setReady(true);
    }

    const existing = document.querySelector(
      'script[data-google-gis="true"]'
    ) as HTMLScriptElement | null;

    if (window.google?.accounts?.id) {
      init();
    } else if (existing) {
      existing.addEventListener("load", init);
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.googleGis = "true";
      script.onload = init;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, next, onError, router]);

  if (!CLIENT_ID) {
    return (
      <button
        type="button"
        className={`btn-ghost min-w-[8rem] ${className}`}
        onClick={() =>
          onError?.(
            "Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID."
          )
        }
      >
        Google
      </button>
    );
  }

  return (
    <div className={`relative min-w-[8rem] ${className}`}>
      <div
        ref={hostRef}
        className={`flex min-h-11 items-center justify-center overflow-hidden ${
          pending ? "pointer-events-none opacity-60" : ""
        }`}
      />
      {!ready ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-[var(--muted)]">
          Google…
        </span>
      ) : null}
    </div>
  );
}
