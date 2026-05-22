import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uydyblzlphwnqsfkiuwj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_APgaDyF0QGeymCU9eFR7fQ_45HE9QZp';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
