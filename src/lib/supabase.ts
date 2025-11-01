import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Validate URL format
try {
    new URL(supabaseUrl)
} catch {
    throw new Error('Invalid Supabase URL format')
}

// Basic validation for anon key format
if (!supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.length < 100) {
    throw new Error('Invalid Supabase anon key format')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
    PROFILES: 'profiles',
    COURSES: 'courses',
    ENROLLMENTS: 'enrollments',
    VIDEOS: 'videos',
    COURSE_VIDEOS: 'course_videos',
    USER_SESSIONS: 'user_sessions',
} as const