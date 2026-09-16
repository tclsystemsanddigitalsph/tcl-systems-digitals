"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./ReviewsSliderClient.module.css";

type Review = {
  id: string;
  customer_name: string;
  business_name: string | null;
  product_name: string | null;
  rating: number | string | null;
  review_text: string;
  is_featured: boolean | null;
  display_order?: number | null;
  created_at?: string | null;
};

export default function ReviewsSliderClient({
  reviews,
}: {
  reviews: Review[];
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  const getMetrics = useCallback(() => {
    const slider = sliderRef.current;

    if (!slider) {
      return {
        step: 0,
        visible: 1,
      };
    }

    const firstCard = slider.querySelector<HTMLElement>(
      `.${styles.reviewCard}`,
    );

    if (!firstCard) {
      return {
        step: slider.clientWidth,
        visible: 1,
      };
    }

    const computed = window.getComputedStyle(slider);

    const gap = Number.parseFloat(
      computed.columnGap || computed.gap || "0",
    );

    const cardWidth = firstCard.getBoundingClientRect().width;

    const step = cardWidth + gap;

    const visible = Math.max(
      1,
      Math.round((slider.clientWidth + gap) / step),
    );

    return {
      step,
      visible,
    };
  }, []);

  const updatePosition = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const { step, visible } = getMetrics();

    if (step <= 0) return;

    const maxIndex = Math.max(0, reviews.length - visible);

    const nextIndex = Math.min(
      Math.max(0, Math.round(slider.scrollLeft / step)),
      maxIndex,
    );

    setVisibleCount(visible);
    setActiveIndex(nextIndex);
  }, [getMetrics, reviews.length]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const frame = requestAnimationFrame(() => {
      updatePosition();
    });

    const onScroll = () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }

      scrollTimerRef.current = setTimeout(() => {
        updatePosition();
        scrollTimerRef.current = null;
      }, 60);
    };

    const onResize = () => {
      updatePosition();
    };

    slider.addEventListener("scroll", onScroll, {
      passive: true,
    });

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);

      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }

      slider.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [updatePosition]);

  const pageCount = Math.max(
    1,
    reviews.length - visibleCount + 1,
  );

  const dots = useMemo(() => {
    return Array.from(
      { length: pageCount },
      (_, index) => index,
    );
  }, [pageCount]);

  const goTo = useCallback(
    (index: number) => {
      const slider = sliderRef.current;
      if (!slider) return;

      const { step } = getMetrics();

      if (step <= 0) return;

      const safeIndex = Math.min(
        Math.max(index, 0),
        pageCount - 1,
      );

      slider.scrollTo({
        left: safeIndex * step,
        behavior: "smooth",
      });

      setActiveIndex(safeIndex);
    },
    [getMetrics, pageCount],
  );

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className={styles.shell}>
      <div
        ref={sliderRef}
        className={styles.slider}
        aria-label="Customer reviews"
      >
        {reviews.map((review) => {
          const rating = Math.max(
            1,
            Math.min(5, Number(review.rating) || 5),
          );

          const initial =
            review.customer_name?.trim().charAt(0).toUpperCase() ||
            "T";

          return (
            <article
              className={styles.reviewCard}
              key={review.id}
            >
              {review.is_featured && (
                <span className={styles.featured}>
                  Featured
                </span>
              )}

              <div className={styles.reviewTop}>
                <div
                  className={styles.quoteIcon}
                  aria-hidden="true"
                >
                  “
                </div>

                <div
                  className={styles.stars}
                  aria-label={`${rating} out of 5 stars`}
                >
                  {"★".repeat(rating)}
                </div>
              </div>

              <p className={styles.reviewText}>
                {review.review_text}
              </p>

              <div className={styles.client}>
                <div className={styles.avatar}>
                  {initial}
                </div>

                <div className={styles.clientInfo}>
                  <strong>
                    {review.customer_name}
                  </strong>

                  <span>
                    {review.business_name || "TCL Client"}
                  </span>
                </div>
              </div>

              <div className={styles.product}>
                <span>
                  {review.product_name
                    ? "Purchased"
                    : "Review"}
                </span>

                <strong>
                  {review.product_name ||
                    "TCL Systems & Digitals PH"}
                </strong>
              </div>
            </article>
          );
        })}
      </div>

      {pageCount > 1 && (
        <div
          className={styles.controls}
          aria-label="Review slider controls"
        >
          <button
            type="button"
            className={styles.arrow}
            onClick={() => goTo(activeIndex - 1)}
            disabled={activeIndex <= 0}
            aria-label="Previous review"
          >
            <span aria-hidden="true">←</span>
          </button>

          <div
            className={styles.dots}
            aria-label="Review pagination"
          >
            {dots.map((index) => (
              <button
                key={index}
                type="button"
                className={`${styles.dot} ${
                  index === activeIndex
                    ? styles.activeDot
                    : ""
                }`}
                onClick={() => goTo(index)}
                aria-label={`Go to review ${
                  index + 1
                }`}
                aria-current={
                  index === activeIndex
                    ? "true"
                    : undefined
                }
              />
            ))}
          </div>

          <button
            type="button"
            className={styles.arrow}
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex >= pageCount - 1}
            aria-label="Next review"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}