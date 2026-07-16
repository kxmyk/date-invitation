import { useMemo, useState } from 'react';
import { FOOD_OPTIONS } from '../config';
import { createDatePlan } from '../services/dateService';

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0'));

function toLocalDateInputValue(date) {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function getInitialForm() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    date: toLocalDateInputValue(tomorrow),
    timeHour: '18',
    timeMinute: '00',
    foodType: '',
    customFood: '',
    place: '',
    message: '',
    surpriseMe: false,
  };
}

export function DatePlanner({ onSaved }) {
  const [form, setForm] = useState(getInitialForm);
  const [submitState, setSubmitState] = useState({ status: 'idle', message: '' });
  const minimumDate = useMemo(() => toLocalDateInputValue(new Date()), []);

  function updateField(event) {
    const { name, type, value, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitState({ status: 'loading', message: '' });

    const dateTime = new Date(`${form.date}T${form.timeHour}:${form.timeMinute}:00`);

    if (Number.isNaN(dateTime.getTime()) || dateTime <= new Date()) {
      setSubmitState({
        status: 'error',
        message: 'Wybierz termin znajdujący się w przyszłości.',
      });
      return;
    }

    if (!form.foodType) {
      setSubmitState({ status: 'error', message: 'Wybierz rodzaj jedzenia.' });
      return;
    }

    if (form.foodType === 'custom' && !form.customFood.trim()) {
      setSubmitState({ status: 'error', message: 'Wpisz własną propozycję jedzenia.' });
      return;
    }

    try {
      await createDatePlan({
        ...form,
        dateTime,
      });

      setSubmitState({ status: 'success', message: '' });
      onSaved({
        ...form,
        dateTime,
      });
    } catch (error) {
      console.error(error);
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Nie udało się zapisać randki.',
      });
    }
  }

  return (
    <section className="planner-card glass-card" aria-labelledby="planner-title">
      <div className="planner-heading">
        <div>
          <p className="eyebrow">No to planujemy 💗</p>
          <h1 id="planner-title">Wybierz naszą randkę</h1>
        </div>
        <span className="planner-emoji" aria-hidden="true">🌷</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="section-title-row">
            <span className="section-number">1</span>
            <div>
              <h2>Kiedy się widzimy?</h2>
              <p>Wybierz datę i godzinę.</p>
            </div>
          </div>

          <div className="two-column-grid">
            <label className="form-field">
              <span>Data</span>
              <input
                name="date"
                type="date"
                min={minimumDate}
                value={form.date}
                onChange={updateField}
                required
              />
            </label>

            <label className="form-field">
              <span>Godzina</span>
              <div className="time-picker-24">
                <select
                  name="timeHour"
                  value={form.timeHour}
                  onChange={updateField}
                  aria-label="Godzina"
                  required
                >
                  {HOUR_OPTIONS.map((hour) => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
                <span aria-hidden="true">:</span>
                <select
                  name="timeMinute"
                  value={form.timeMinute}
                  onChange={updateField}
                  aria-label="Minuty"
                  required
                >
                  {MINUTE_OPTIONS.map((minute) => (
                    <option key={minute} value={minute}>{minute}</option>
                  ))}
                </select>
              </div>
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="section-title-row">
            <span className="section-number">2</span>
            <div>
              <h2>Na co mamy ochotę?</h2>
              <p>Kliknij jeden z kafelków.</p>
            </div>
          </div>

          <div className="food-grid" role="radiogroup" aria-label="Rodzaj jedzenia">
            {FOOD_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`food-option ${form.foodType === option.value ? 'is-selected' : ''}`}
              >
                <input
                  type="radio"
                  name="foodType"
                  value={option.value}
                  checked={form.foodType === option.value}
                  onChange={updateField}
                />
                <span className="food-emoji" aria-hidden="true">{option.emoji}</span>
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          {form.foodType === 'custom' && (
            <label className="form-field custom-food-field">
              <span>Twoja propozycja</span>
              <input
                name="customFood"
                type="text"
                value={form.customFood}
                onChange={updateField}
                maxLength={80}
                placeholder="Np. ramen, naleśniki, piknik…"
                required
              />
            </label>
          )}
        </div>

        <div className="form-section">
          <div className="section-title-row">
            <span className="section-number">3</span>
            <div>
              <h2>Drobne szczegóły</h2>
              <p>Te pola są opcjonalne.</p>
            </div>
          </div>

          <label className="form-field">
            <span>Proponowane miejsce</span>
            <input
              name="place"
              type="text"
              value={form.place}
              onChange={updateField}
              maxLength={120}
              placeholder="Nazwa restauracji albo „do ustalenia”"
            />
          </label>

          <label className="form-field">
            <span>Wiadomość dla mnie</span>
            <textarea
              name="message"
              value={form.message}
              onChange={updateField}
              maxLength={300}
              rows={3}
              placeholder="Np. chcę potem iść na spacer 💗"
            />
          </label>

          <label className="checkbox-field">
            <input
              name="surpriseMe"
              type="checkbox"
              checked={form.surpriseMe}
              onChange={updateField}
            />
            <span className="custom-checkbox" aria-hidden="true">✓</span>
            <span>Wybierz miejsce za mnie — lubię niespodzianki ✨</span>
          </label>
        </div>

        {submitState.status === 'error' && (
          <p className="form-message error-message" role="alert">{submitState.message}</p>
        )}

        <button className="button button-primary submit-button" type="submit" disabled={submitState.status === 'loading'}>
          {submitState.status === 'loading' ? 'Zapisuję…' : 'Zapisz naszą randkę 💕'}
        </button>
      </form>
    </section>
  );
}
