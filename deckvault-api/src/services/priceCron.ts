import cron from 'node-cron';
import { Pool } from 'pg';
import { syncCards } from './cardSyncService';

export function startPriceCron(db: Pool) {
  // Run every 24 hours at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled card price sync...');
    await syncCards(db);
  });

  console.log('Price sync cron job scheduled (runs daily at midnight)');
}