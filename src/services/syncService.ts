
import { api } from './api';
import { db } from './database';

export const syncService = {
    syncAll: async (userId: string) => {
        try {
            console.log('🔄 Syncing with PostgreSQL backend...');

            // 1. Sync Profile
            const profile = await api.profiles.get().catch(() => null);
            if (profile) {
                db.profiles.sync(profile);
            }

            // 2. Sync Expenses
            const expenses = await api.expenses.getAll().catch(() => []);
            db.expenses.sync(expenses);

            // 3. Sync Income
            const income = await api.income.getAll().catch(() => []);
            db.income.sync(income);

            // 4. Sync Goals
            const goals = await api.goals.getAll().catch(() => []);
            db.goals.sync(goals);

            // 5. Sync Investments
            const investments = await api.investments.getAll().catch(() => []);
            db.investments.sync(investments);

            // 6. Sync Admin Alerts
            const alerts = await api.admin.getAlerts().catch(() => []);
            alerts.forEach(a => {
                db.admin.createAlert(a);
            });

            console.log('✅ Sync complete');
        } catch (error) {
            console.error('❌ Sync failed:', error);
        }
    }
};
