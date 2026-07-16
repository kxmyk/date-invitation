import { useEffect, useState } from 'react';
import { FOOD_OPTIONS } from '../config';
import { subscribeToDates } from '../services/dateService';

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'full',
  timeStyle: 'short',
});

function getFoodLabel(date) {
  if (date.foodType === 'custom') {
    return date.customFood || 'Własna propozycja';
  }

  return FOOD_OPTIONS.find((option) => option.value === date.foodType)?.label ?? date.foodType;
}

function getFoodEmoji(foodType) {
  return FOOD_OPTIONS.find((option) => option.value === foodType)?.emoji ?? '💗';
}

export function DatesDrawer({ isOpen, onClose }) {
  const [dates, setDates] = useState([]);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setStatus('loading');
    setErrorMessage('');

    let unsubscribe;

    try {
      unsubscribe = subscribeToDates(
        (nextDates) => {
          setDates(nextDates);
          setStatus('success');
        },
        (error) => {
          console.error(error);
          setErrorMessage('Nie udało się pobrać zapisanych randek. Sprawdź konfigurację Firebase i reguły Firestore.');
          setStatus('error');
        },
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nie udało się połączyć z Firebase.');
      setStatus('error');
    }

    return () => unsubscribe?.();
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      <button
        className={`drawer-backdrop ${isOpen ? 'is-visible' : ''}`}
        type="button"
        aria-label="Zamknij panel zapisanych randek"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />

      <aside className={`dates-drawer ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen} aria-label="Zaplanowane randki">
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Nasze plany</p>
            <h2>Zaplanowane randki 💌</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Zamknij panel">×</button>
        </div>

        <div className="drawer-content">
          {status === 'loading' && <p className="drawer-state">Pobieram nasze plany…</p>}
          {status === 'error' && <p className="drawer-state drawer-error" role="alert">{errorMessage}</p>}

          {status === 'success' && dates.length === 0 && (
            <div className="empty-state">
              <span aria-hidden="true">🌸</span>
              <h3>Jeszcze nic tu nie ma</h3>
              <p>Pierwsza zapisana randka pojawi się właśnie tutaj.</p>
            </div>
          )}

          {status === 'success' && dates.length > 0 && (
            <div className="date-list">
              {dates.map((date) => {
                const javaScriptDate = date.dateTime?.toDate?.();

                return (
                  <article className="saved-date-card" key={date.id}>
                    <div className="saved-date-icon" aria-hidden="true">{getFoodEmoji(date.foodType)}</div>
                    <div>
                      <h3>{getFoodLabel(date)}</h3>
                      <p className="saved-date-time">
                        {javaScriptDate ? dateFormatter.format(javaScriptDate) : 'Termin do ustalenia'}
                      </p>
                      <p><strong>Miejsce:</strong> {date.surpriseMe ? 'Niespodzianka ✨' : date.place || 'Do ustalenia'}</p>
                      {date.message && <p className="saved-date-message">„{date.message}”</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
