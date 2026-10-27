"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import PageLoader from "@/components/ui/PageLoader";

const MIN_VISIBLE_MS = 450;

function isLandingPath(pathname: string | null | undefined) {
  if (!pathname) return false;
  return (
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/buy" ||
    pathname.startsWith("/buy/") ||
    pathname === "/sell" ||
    pathname === "/contact" ||
    pathname === "/privacy" ||
    pathname === "/terms"
  );
}

function LandingOverlay() {
  return (
    <div
      className="fixed inset-0 z-[200] bg-[var(--bg)]"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <PageLoader fullScreen label="Loading…" />
    </div>
  );
}

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [overlay, setOverlay] = useState(() => isLandingPath(pathname));

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const active = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathRef = useRef(pathname);
  const searchRef = useRef(searchKey);
  const targetPath = useRef<string | null>(
    isLandingPath(pathname) ? pathname : null,
  );
  const holdUntil = useRef(isLandingPath(pathname) ? Date.now() : 0);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const clearHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const scheduleHide = () => {
    clearHide();
    if (!targetPath.current || pathRef.current !== targetPath.current) return;
    const wait = Math.max(0, holdUntil.current + MIN_VISIBLE_MS - Date.now());
    hideTimer.current = setTimeout(() => {
      hideTimer.current = null;
      if (pathRef.current !== targetPath.current) return;
      setOverlay(false);
      targetPath.current = null;
    }, wait);
  };

  const showOverlay = (nextPath: string) => {
    clearHide();
    targetPath.current = nextPath;
    holdUntil.current = Date.now();
    setOverlay(true);
    if (pathRef.current === nextPath) scheduleHide();
  };

  const hideOverlay = () => {
    clearHide();
    targetPath.current = null;
    setOverlay(false);
  };

  const start = () => {
    if (active.current) return;
    active.current = true;
    clearTimers();
    setFading(false);
    setVisible(true);
    setProgress(12);
    timers.current.push(
      setTimeout(() => setProgress(45), 120),
      setTimeout(() => setProgress(70), 320),
      setTimeout(() => setProgress(82), 700),
    );
  };

  const complete = () => {
    if (!active.current) return;
    clearTimers();
    active.current = false;
    setProgress(100);
    setFading(true);
    timers.current.push(
      setTimeout(() => {
        setVisible(false);
        setFading(false);
        setProgress(0);
      }, 280),
    );
  };

  const api = useRef({ showOverlay, hideOverlay, start, scheduleHide });
  api.current = { showOverlay, hideOverlay, start, scheduleHide };

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as Element | null;
      if (target?.closest("button, input, textarea, select, label")) return;

      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      const next = `${url.pathname}${url.search}`;
      const current = `${window.location.pathname}${window.location.search}`;
      if (next === current) return;

      if (url.pathname !== window.location.pathname && isLandingPath(url.pathname)) {
        api.current.showOverlay(url.pathname);
        return;
      }

      if (url.pathname !== window.location.pathname) {
        api.current.hideOverlay();
      }

      api.current.start();
    };

    const onLocationChange = (nextPath: string, nextSearch: string) => {
      if (nextPath === pathRef.current && nextSearch === searchRef.current) return;

      if (nextPath !== pathRef.current && isLandingPath(nextPath)) {
        api.current.showOverlay(nextPath);
        return;
      }

      if (nextPath !== pathRef.current) {
        api.current.hideOverlay();
      }

      api.current.start();
    };

    const onPopState = () => {
      onLocationChange(
        window.location.pathname,
        window.location.search.replace(/^\?/, ""),
      );
    };

    const onNavigate = (event: Event) => {
      const navEvent = event as Event & {
        destination?: { url?: string };
      };
      const destination = navEvent.destination?.url;
      if (!destination) return;

      let url: URL;
      try {
        url = new URL(destination);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      onLocationChange(url.pathname, url.search.replace(/^\?/, ""));
    };

    document.addEventListener("click", onClick, true);
    // Capture runs before Next's popstate listener. The Navigation API
    // traverse event fires even earlier, while the URL is still the old page.
    window.addEventListener("popstate", onPopState, true);
    const navigation = (
      window as Window & {
        navigation?: {
          addEventListener: (
            type: "navigate",
            listener: (event: Event) => void,
          ) => void;
          removeEventListener: (
            type: "navigate",
            listener: (event: Event) => void,
          ) => void;
        };
      }
    ).navigation;
    navigation?.addEventListener("navigate", onNavigate);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState, true);
      navigation?.removeEventListener("navigate", onNavigate);
    };
  }, []);

  useEffect(() => {
    pathRef.current = pathname;
    searchRef.current = searchKey;

    if (!isLandingPath(pathname)) {
      api.current.hideOverlay();
      return;
    }

    if (targetPath.current === pathname) {
      api.current.scheduleHide();
    }

    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    };
    // scheduleHide reads refs; pathname/searchKey are the route signals
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchKey]);

  useEffect(() => {
    if (!overlay) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [overlay]);

  useEffect(() => {
    complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- finish the thin bar when the route settles
  }, [pathname, searchKey]);

  useEffect(() => () => clearTimers(), []);

  return (
    <>
      {overlay ? <LandingOverlay /> : null}
      {visible ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px]"
          aria-hidden
        >
          <div
            className="h-full origin-left bg-[var(--accent)] transition-[width,opacity] duration-200 ease-out"
            style={{
              width: `${progress}%`,
              opacity: fading ? 0 : 1,
            }}
          />
        </div>
      ) : null}
    </>
  );
}

function LandingLoaderFallback() {
  const pathname = usePathname();
  if (!isLandingPath(pathname)) return null;
  return <LandingOverlay />;
}

export default function NavigationProgress() {
  return (
    <Suspense fallback={<LandingLoaderFallback />}>
      <NavigationProgressInner />
    </Suspense>
  );
}
