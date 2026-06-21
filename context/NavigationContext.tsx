"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

type NavigationContextValue = {
  isNavigating: boolean;
  startNavigation: () => void;
  finishNavigation: () => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

function isInternalNavigationAnchor(anchor: HTMLAnchorElement): URL | null {
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return null;
  }

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) {
    return null;
  }

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export function useOptionalNavigation() {
  return useContext(NavigationContext);
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  const pendingAnchorRef = useRef<HTMLElement | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const routeRef = useRef<string | null>(null);
  const hashOnlyTimerRef = useRef<number | null>(null);

  const clearPendingAnchor = useCallback(() => {
    if (pendingAnchorRef.current) {
      pendingAnchorRef.current.removeAttribute("data-nav-pending");
      pendingAnchorRef.current = null;
    }
  }, []);

  const finishNavigation = useCallback(() => {
    setProgress(100);
    clearPendingAnchor();

    if (finishTimerRef.current) {
      window.clearTimeout(finishTimerRef.current);
    }

    finishTimerRef.current = window.setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
      finishTimerRef.current = null;
    }, 420);
  }, [clearPendingAnchor]);

  const startNavigation = useCallback(() => {
    if (finishTimerRef.current) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }

    setIsNavigating(true);
    setProgress((current) => (current > 12 ? current : 12));
  }, []);

  useEffect(() => {
    const route = `${pathname}?${searchParams.toString()}`;

    if (routeRef.current !== null && routeRef.current !== route) {
      finishNavigation();
    }

    routeRef.current = route;
  }, [pathname, searchParams, finishNavigation]);

  useEffect(() => {
    if (!isNavigating) {
      return;
    }

    const interval = window.setInterval(() => {
      setProgress((current) => (current >= 92 ? current : current + (92 - current) * 0.14));
    }, 260);

    return () => window.clearInterval(interval);
  }, [isNavigating]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element).closest("a");
      if (!anchor) {
        return;
      }

      const url = isInternalNavigationAnchor(anchor);
      if (!url) {
        return;
      }

      const samePath = url.pathname === window.location.pathname;
      const sameSearch = url.search === window.location.search;
      const hasHash = Boolean(url.hash);

      if (samePath && sameSearch && !hasHash) {
        return;
      }

      clearPendingAnchor();
      anchor.setAttribute("data-nav-pending", "true");
      pendingAnchorRef.current = anchor;
      startNavigation();

      if (samePath && sameSearch && hasHash) {
        if (hashOnlyTimerRef.current) {
          window.clearTimeout(hashOnlyTimerRef.current);
        }

        hashOnlyTimerRef.current = window.setTimeout(() => {
          finishNavigation();
          hashOnlyTimerRef.current = null;
        }, 480);
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [clearPendingAnchor, finishNavigation, startNavigation]);

  useEffect(() => {
    return () => {
      clearPendingAnchor();

      if (finishTimerRef.current) {
        window.clearTimeout(finishTimerRef.current);
      }

      if (hashOnlyTimerRef.current) {
        window.clearTimeout(hashOnlyTimerRef.current);
      }
    };
  }, [clearPendingAnchor]);

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation, finishNavigation }}>
      {children}
      <div
        className="neptura-nav-progress"
        style={{
          width: `${progress}%`,
          opacity: progress > 0 ? 1 : 0,
        }}
        aria-hidden
      />
    </NavigationContext.Provider>
  );
}
