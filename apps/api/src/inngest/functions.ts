import { inngest } from './client.js';
import { supabase } from '../db/client.js';

export const dailyEmailAlert = inngest.createFunction(
  { 
    id: 'daily-email-alert',
    triggers: [{ cron: '0 9 * * *' }] // Runs every day at 9 AM UTC
  },
  async ({ step }) => {
    // 1. Fetch users who have email notifications enabled
    const profiles = await step.run('fetch-opted-in-users', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email_notifications_enabled')
        .eq('email_notifications_enabled', true);

      if (error) {
        throw new Error(`Failed to fetch profiles: ${error.message}`);
      }
      return data || [];
    });

    if (profiles.length === 0) {
      return { message: 'No users opted in for email notifications.' };
    }

    const now = new Date().toISOString();

    // 2. Process each user to see if they have due cards
    // Use step.sendEvent or loop within a single step for simplicity since it's an MVP
    const emailsSent = await step.run('check-due-cards-and-send', async () => {
      let count = 0;
      
      for (const profile of profiles) {
        // Count due cards
        const { count: dueCount, error } = await supabase
          .from('flashcards')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .lte('next_review_at', now);

        if (error) {
          console.error(`Failed to fetch flashcards for user ${profile.id}:`, error);
          continue;
        }

        if (dueCount && dueCount > 0) {
          // Mock sending email
          console.log(`[MOCK EMAIL] -> Sending email to User ${profile.id}: "You have ${dueCount} cards due for review today on Orma!"`);
          count++;
        }
      }

      return count;
    });

    return { message: `Successfully sent ${emailsSent} daily review emails.` };
  }
);
