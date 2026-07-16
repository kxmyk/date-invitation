import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { APP_CONFIG } from '../config';

const NO_MESSAGES = [
  'Nie',
  'Na pewno? 🥺',
  'Jeszcze raz 😌',
  'Pudło 💗',
  'No weź 😘',
  'To to nie teraz 😎',
  'A może jednak? 🫣',  
];

const SAFE_MARGIN = 28;
const HEADER_HEIGHT = 86;
const MOVE_LOCK_MS = 360;
const MIN_DISTANCE_FROM_CURSOR = 210;
const MIN_DISTANCE_FROM_CURRENT = 170;
const BUTTON_WIDTH = 190;
const BUTTON_HEIGHT = 58;

function rectanglesOverlap(first, second, padding = 22) {
  return !(
    first.right + padding < second.left ||
    first.left - padding > second.right ||
    first.bottom + padding < second.top ||
    first.top - padding > second.bottom
  );
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function distanceBetween(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

export function InvitationCard({ onAccept }) {
  const noButtonRef = useRef(null);
  const initialNoButtonRef = useRef(null);
  const yesButtonRef = useRef(null);
  const movementLockedRef = useRef(false);
  const floatingButtonInitializedRef = useRef(false);
  const unlockTimerRef = useRef(null);
  const [noPosition, setNoPosition] = useState(null);
  const [escapeCount, setEscapeCount] = useState(0);

  const getMovementArea = useCallback(() => {
    const button = noButtonRef.current;
    const buttonWidth = button?.offsetWidth || BUTTON_WIDTH;
    const buttonHeight = button?.offsetHeight || BUTTON_HEIGHT;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const minLeft = SAFE_MARGIN;
    const maxLeft = Math.max(minLeft, viewportWidth - buttonWidth - SAFE_MARGIN);
    const preferredMinTop = Math.max(SAFE_MARGIN, HEADER_HEIGHT);
    const maxTop = Math.max(SAFE_MARGIN, viewportHeight - buttonHeight - SAFE_MARGIN);
    const minTop = Math.min(preferredMinTop, maxTop);

    return {
      buttonWidth,
      buttonHeight,
      minLeft,
      maxLeft,
      minTop,
      maxTop,
    };
  }, []);

  const initializeFloatingButton = useCallback(() => {
    if (floatingButtonInitializedRef.current) {
      return;
    }

    const rectangle = initialNoButtonRef.current?.getBoundingClientRect();

    if (!rectangle) {
      return;
    }

    floatingButtonInitializedRef.current = true;
    const area = getMovementArea();
    setNoPosition({
      left: clamp(rectangle.left, area.minLeft, area.maxLeft),
      top: clamp(rectangle.top, area.minTop, area.maxTop),
    });
  }, [getMovementArea]);

  useEffect(() => {
    // Fallback for browsers or accessibility settings that skip animationend.
    const fallbackTimer = window.setTimeout(initializeFloatingButton, 700);
    return () => window.clearTimeout(fallbackTimer);
  }, [initializeFloatingButton]);

  const moveNoButton = useCallback((pointerEvent) => {
    if (movementLockedRef.current) {
      return;
    }

    movementLockedRef.current = true;
    window.clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = window.setTimeout(() => {
      movementLockedRef.current = false;
    }, MOVE_LOCK_MS);

    const area = getMovementArea();
    const yesRectangle = yesButtonRef.current?.getBoundingClientRect();
    const currentRectangle = noButtonRef.current?.getBoundingClientRect();

    const pointer = {
      x: pointerEvent?.clientX ?? currentRectangle?.left ?? 0,
      y: pointerEvent?.clientY ?? currentRectangle?.top ?? 0,
    };

    const currentCenter = currentRectangle
      ? {
          x: currentRectangle.left + currentRectangle.width / 2,
          y: currentRectangle.top + currentRectangle.height / 2,
        }
      : pointer;

    const candidates = [];

    for (let attempt = 0; attempt < 80; attempt += 1) {
      const candidate = {
        left: Math.round(area.minLeft + Math.random() * (area.maxLeft - area.minLeft)),
        top: Math.round(area.minTop + Math.random() * (area.maxTop - area.minTop)),
      };

      const candidateCenter = {
        x: candidate.left + area.buttonWidth / 2,
        y: candidate.top + area.buttonHeight / 2,
      };

      const candidateRectangle = {
        left: candidate.left,
        top: candidate.top,
        right: candidate.left + area.buttonWidth,
        bottom: candidate.top + area.buttonHeight,
      };

      if (yesRectangle && rectanglesOverlap(candidateRectangle, yesRectangle)) {
        continue;
      }

      candidates.push({
        ...candidate,
        cursorDistance: distanceBetween(candidateCenter, pointer),
        movementDistance: distanceBetween(candidateCenter, currentCenter),
      });
    }

    const preferredCandidate = candidates.find(
      (candidate) =>
        candidate.cursorDistance >= MIN_DISTANCE_FROM_CURSOR &&
        candidate.movementDistance >= MIN_DISTANCE_FROM_CURRENT,
    );

    const fallbackCandidate = candidates.sort(
      (first, second) =>
        second.cursorDistance + second.movementDistance -
        (first.cursorDistance + first.movementDistance),
    )[0];

    const nextPosition = preferredCandidate ?? fallbackCandidate ?? {
      left: area.minLeft,
      top: area.maxTop,
    };

    setNoPosition({
      left: clamp(nextPosition.left, area.minLeft, area.maxLeft),
      top: clamp(nextPosition.top, area.minTop, area.maxTop),
    });
    setEscapeCount((current) => current + 1);
  }, [getMovementArea]);

  useEffect(() => {
    function keepButtonInsideViewport() {
      const area = getMovementArea();

      setNoPosition((current) => {
        if (!current) {
          return current;
        }

        return {
          left: clamp(current.left, area.minLeft, area.maxLeft),
          top: clamp(current.top, area.minTop, area.maxTop),
        };
      });
    }

    window.addEventListener('resize', keepButtonInsideViewport);

    return () => {
      window.removeEventListener('resize', keepButtonInsideViewport);
      window.clearTimeout(unlockTimerRef.current);
    };
  }, [getMovementArea]);

  const floatingNoButton = noPosition ? (
    <button
      ref={noButtonRef}
      className="button button-secondary no-button is-floating"
      style={{
        left: `${noPosition.left}px`,
        top: `${noPosition.top}px`,
      }}
      type="button"
      onPointerEnter={moveNoButton}
      onPointerDown={(event) => {
        event.preventDefault();
        moveNoButton(event);
      }}
      onClick={(event) => {
        event.preventDefault();
      }}
      aria-label="Nie — przycisk ucieka przed kursorem"
    >
      {NO_MESSAGES[Math.min(escapeCount, NO_MESSAGES.length - 1)]}
    </button>
  ) : null;

  return (
    <>
      <section
        className="invitation-card glass-card"
        aria-labelledby="invitation-title"
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && event.animationName === 'card-enter') {
            initializeFloatingButton();
          }
        }}
      >
        <div className="card-decoration" aria-hidden="true">
          💌
        </div>
        <p className="eyebrow">Hej, {APP_CONFIG.inviteeName}!</p>
        <h1 id="invitation-title">{APP_CONFIG.headline}</h1>
        <p className="card-subtitle">{APP_CONFIG.subtitle}</p>

        <div className="invitation-actions">
          <button ref={yesButtonRef} className="button button-primary yes-button" type="button" onClick={onAccept}>
            Tak! 💕
          </button>

          {noPosition ? (
            <span className="no-button-placeholder" aria-hidden="true" />
          ) : (
            <button
              ref={initialNoButtonRef}
              className="button button-secondary no-button"
              type="button"
              aria-label="Nie — przycisk ucieka przed kursorem"
            >
              Nie
            </button>
          )}
        </div>

        <p className="tiny-hint">Podpowiedź: jedna odpowiedź jest zdecydowanie łatwiejsza do kliknięcia ✨</p>
      </section>

      {floatingNoButton && createPortal(floatingNoButton, document.body)}
    </>
  );
}
