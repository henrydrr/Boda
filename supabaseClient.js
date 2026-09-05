import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vrgstysxroisgfueerpi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9Kd2_qpzIhxZG1jP6Tt8-Q_smtyUJGP';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
