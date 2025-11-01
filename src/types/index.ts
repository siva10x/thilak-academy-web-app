// Database types matching actual Supabase schema

export interface Profile {
    id: string;
    updated_at: string | null;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    website: string | null;
    email: string | null;
    is_admin: boolean | null;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    course_type: string;
    thumbnail_url: string;
    num_videos: number;
    zoom_link: string | null;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface Enrollment {
    id: string;
    user_id: string;
    course_id: string;
    status: string;
    expiry_date: string | null;
    enrolled_at: string;
    created_at: string;
    updated_at: string;
}

export interface EnrollmentWithUser extends Enrollment {
    profile: Profile;
}

export interface Video {
    id: string;
    title: string;
    description: string | null;
    video_url: string | null;
    thumbnail_url: string | null;
    resources: any; // jsonb type
    uploaded_at: string;
    created_at: string;
    updated_at: string;
    vimeo_id: string | null;
}

export interface CourseVideo {
    id: string;
    course_id: string;
    video_id: string;
    display_order: number;
    created_at: string;
    updated_at: string;
    preview_enabled: boolean;
}

export interface UserSession {
    id: string;
    user_id: string;
    session_token: string;
    expires_at: string;
    created_at: string;
}// Auth types
export interface User {
    id: string;
    email: string;
    profile?: Profile;
}

// API Response types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    loading?: boolean;
}

// Component Props types
export interface CourseCardProps {
    course: Course;
    isEnrolled?: boolean;
    onEnroll?: (courseId: string) => void;
}

export interface VideoPlayerProps {
    video: Video;
    onVideoEnd?: () => void;
}

export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}