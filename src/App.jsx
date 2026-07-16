import { useState } from 'react';
import './App.css';
import { APP_CONFIG, FOOD_OPTIONS } from './config';
import { isFirebaseConfigured } from './firebase';
import { DatePlanner } from './components/DatePlanner';
import { DatesDrawer } from './components/DatesDrawer';
import { FloatingHearts } from './components/FloatingHearts';
import { InvitationCard } from './components/InvitationCard';

const confirmationFormatter = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'full',
  timeStyle: 'short',
});

function getFoodDescription(plan) {
  if (plan.foodType === 'custom') {
    return plan.customFood;
  }

  const food = FOOD_OPTIONS.find((option) => option.value === plan.foodType);
  return food ? `${food.emoji} ${food.label}` : plan.foodType;
}

function SuccessCard({ plan, onPlanAnother, onOpenDates }) {
  return (
    <section className="success-card glass-card" aria-labelledby="success-title">
      <div className="success-heart" aria-hidden="true">♥</div>
      <h1 id="success-title">💕 Randka zapisana! 💕</h1>
      <p className="success-lead">Już nie mogę się doczekać.</p>

      <div className="confirmation-ticket">
        <div>
          <span>Kiedy</span>
          <strong>{confirmationFormatter.format(plan.dateTime)}</strong>
        </div>
        <div>
          <span>Co jemy</span>
          <strong>{getFoodDescription(plan)}</strong>
        </div>
        <div>
          <span>Gdzie</span>
          <strong>{plan.surpriseMe ? 'Niespodzianka ✨' : plan.place || 'Do ustalenia'}</strong>
        </div>
      </div>

      <div className="success-actions">
        <button className="button button-primary" type="button" onClick={onOpenDates}>Zobacz nasze randki 💌</button>
        <button className="button button-ghost" type="button" onClick={onPlanAnother}>Zaplanuj kolejną</button>
      </div>
    </section>
  );
}

export default function App() {
  const [stage, setStage] = useState('invitation');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedPlan, setSavedPlan] = useState(null);
  const [celebrating, setCelebrating] = useState(false);

  function acceptInvitation() {
    setCelebrating(true);
    window.setTimeout(() => {
      setStage('planner');
      setCelebrating(false);
    }, 900);
  }

  function handleSaved(plan) {
    setSavedPlan(plan);
    setCelebrating(true);
    setStage('success');
    window.setTimeout(() => setCelebrating(false), 1500);
  }

  return (
    <div className="app-shell">
      <FloatingHearts celebration={celebrating} />

      <header className="site-header">
        <button className="brand-button" type="button" onClick={() => setStage('invitation')}>
          <span aria-hidden="true">♡</span>
          {APP_CONFIG.brand}
        </button>

        <button className="dates-button" type="button" onClick={() => setDrawerOpen(true)}>
          <span aria-hidden="true">💌</span>
          Zaplanowane randki
        </button>
      </header>

      {!isFirebaseConfigured && (
        <div className="configuration-notice" role="status">
          Tryb demonstracyjny: uzupełnij <code>.env.local</code>, aby włączyć zapis do Firebase.
        </div>
      )}

      <main className="main-content">
        {celebrating && stage === 'invitation' && (
          <div className="celebration-overlay" aria-live="polite">
            <div>
              <span aria-hidden="true">💗</span>
              <h2>{APP_CONFIG.successTitle}</h2>
              <p>{APP_CONFIG.successMessage}</p>
            </div>
          </div>
        )}

        {stage === 'invitation' && <InvitationCard onAccept={acceptInvitation} />}
        {stage === 'planner' && <DatePlanner onSaved={handleSaved} />}
        {stage === 'success' && savedPlan && (
          <SuccessCard
            plan={savedPlan}
            onPlanAnother={() => setStage('planner')}
            onOpenDates={() => setDrawerOpen(true)}
          />
        )}
      </main>

      <DatesDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
