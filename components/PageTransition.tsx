"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "./PageTransition.module.css";

const BEFORE_NAV_MS = 200;
const AFTER_NAV_MS = 160;

export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<"idle" | "loading" | "leaving">("idle");

  const phaseRef = useRef<"idle" | "loading" | "leaving">("idle");
  const navigationStartedRef = useRef(false);
  const navTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const changePhase = (next: "idle" | "loading" | "leaving") => {
    phaseRef.current = next;
    setPhase(next);
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.dataset.noTransition === "true") return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref) return;

      if (
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        rawHref.startsWith("javascript:")
      ) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const current =
        window.location.pathname +
        window.location.search +
        window.location.hash;

      const destination = url.pathname + url.search + url.hash;

      if (destination === current) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (phaseRef.current !== "idle") return;

      changePhase("loading");

      navTimerRef.current = window.setTimeout(() => {
        navigationStartedRef.current = true;
        window.scrollTo(0, 0);
        router.push(destination);
      }, BEFORE_NAV_MS);
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);

      if (navTimerRef.current !== null) {
        window.clearTimeout(navTimerRef.current);
      }

      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [router]);

  useEffect(() => {
    if (!navigationStartedRef.current) return;

    navigationStartedRef.current = false;

    if (navTimerRef.current !== null) {
      window.clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }

    window.scrollTo(0, 0);
    changePhase("leaving");

    hideTimerRef.current = window.setTimeout(() => {
      changePhase("idle");
      hideTimerRef.current = null;
    }, AFTER_NAV_MS);
  }, [pathname]);

  if (phase === "idle") return null;

  return (
    <div
      className={`${styles.loader} ${
        phase === "leaving" ? styles.leaving : ""
      }`}
      role="status"
      aria-label="Loading page"
    >
      <div className={styles.mark} aria-hidden="true">
        <span className={`${styles.fragment} ${styles.fragmentOne}`}>
          <Image src="/tcl-monogram.png" alt="" fill sizes="96px" priority />
        </span>
        <span className={`${styles.fragment} ${styles.fragmentTwo}`}>
          <Image src="/tcl-monogram.png" alt="" fill sizes="96px" priority />
        </span>
        <span className={`${styles.fragment} ${styles.fragmentThree}`}>
          <Image src="/tcl-monogram.png" alt="" fill sizes="96px" priority />
        </span>
        <span className={`${styles.fragment} ${styles.fragmentFour}`}>
          <Image src="/tcl-monogram.png" alt="" fill sizes="96px" priority />
        </span>
        <span className={styles.wholeMark}>
          <Image src="/tcl-monogram.png" alt="" fill sizes="96px" priority />
        </span>
      </div>
    </div>
  );
}
