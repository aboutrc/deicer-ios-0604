import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = 'https://dqklgrcelslhpvnemlze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxa2xncmNlbHNsaHB2bmVtbHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Njg5OTAsImV4cCI6MjA2NDI0NDk5MH0.47Z4WIrk-TV8tPLhw6WxYGCPY_EAbXphFAuIbJcoEds';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);