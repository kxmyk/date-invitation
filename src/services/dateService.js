import {
  Timestamp,
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const DATES_COLLECTION = 'dates';

function requireDatabase() {
  if (!db) {
    throw new Error(
      'Firebase nie jest skonfigurowany. Uzupełnij plik .env.local zgodnie z .env.example.',
    );
  }

  return db;
}

export async function createDatePlan(formData) {
  const database = requireDatabase();

  return addDoc(collection(database, DATES_COLLECTION), {
    dateTime: Timestamp.fromDate(formData.dateTime),
    foodType: formData.foodType,
    customFood: formData.customFood.trim(),
    place: formData.place.trim(),
    message: formData.message.trim(),
    surpriseMe: formData.surpriseMe,
    status: 'planned',
    createdAt: serverTimestamp(),
  });
}

export function subscribeToDates(onData, onError) {
  const database = requireDatabase();
  const datesQuery = query(
    collection(database, DATES_COLLECTION),
    orderBy('dateTime', 'asc'),
    limit(50),
  );

  return onSnapshot(
    datesQuery,
    (snapshot) => {
      const dates = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      onData(dates);
    },
    onError,
  );
}
