import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, TABLES } from '../lib/supabase'
import type { Course, Enrollment, Video, CourseVideo } from '../types'

// Courses
export function useCourses() {
    return useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from(TABLES.COURSES)
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching courses:', error)
                throw new Error(`Failed to fetch courses: ${error.message}`)
            }
            return data as Course[]
        },
        retry: (failureCount, error) => {
            console.error(`Query failed ${failureCount} times:`, error)
            return failureCount < 2
        },
    })
}

export function useCourse(courseId: string) {
    return useQuery({
        queryKey: ['course', courseId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from(TABLES.COURSES)
                .select('*')
                .eq('id', courseId)
                .single()

            if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
            return data as Course | null
        },
        enabled: !!courseId,
    })
}

// Enrollments
export function useUserEnrollments(userId: string) {
    return useQuery({
        queryKey: ['enrollments', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from(TABLES.ENROLLMENTS)
                .select(`
          *,
          course:courses(*)
        `)
                .eq('user_id', userId)

            if (error) throw error
            return data as (Enrollment & { course: Course })[]
        },
        enabled: !!userId,
    })
}

export function useEnrollInCourse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId, courseId }: { userId: string; courseId: string }) => {
            const { error } = await supabase
                .from(TABLES.ENROLLMENTS)
                .insert([
                    {
                        user_id: userId,
                        course_id: courseId,
                        status: 'pending',
                    },
                ])

            if (error) throw error
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['enrollments', variables.userId] })
            queryClient.invalidateQueries({ queryKey: ['enrollment-status', variables.userId, variables.courseId] })
            queryClient.invalidateQueries({ queryKey: ['admin-pending-enrollments'] })
        },
    })
}

// Course Videos
export function useCourseVideos(courseId: string) {
    return useQuery({
        queryKey: ['course-videos', courseId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from(TABLES.COURSE_VIDEOS)
                .select(`
          *,
          video:videos(*)
        `)
                .eq('course_id', courseId)
                .order('display_order')

            if (error) throw error
            return data as (CourseVideo & { video: Video })[]
        },
        enabled: !!courseId,
    })
}

// Check if user is enrolled in course
export function useIsEnrolled(userId: string, courseId: string) {
    return useQuery({
        queryKey: ['enrollment-status', userId, courseId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from(TABLES.ENROLLMENTS)
                .select('id, status')
                .eq('user_id', userId)
                .eq('course_id', courseId)
                .eq('status', 'active')
                .single()

            if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
            return !!data
        },
        enabled: !!userId && !!courseId,
    })
}

// Get user enrollment details for a course
export function useEnrollmentStatus(userId: string, courseId: string) {
    return useQuery({
        queryKey: ['enrollment-details', userId, courseId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from(TABLES.ENROLLMENTS)
                .select('id, status, created_at')
                .eq('user_id', userId)
                .eq('course_id', courseId)
                .single()

            if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
            return data as Enrollment | null
        },
        enabled: !!userId && !!courseId,
    })
}

// Admin functions
export function useCourseEnrollments(courseId: string) {
    return useQuery({
        queryKey: ['course-enrollments', courseId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from(TABLES.ENROLLMENTS)
                .select(`
                    *,
                    profile:profiles!enrollments_user_id_fkey(*)
                `)
                .eq('course_id', courseId)
                .order('enrolled_at', { ascending: false })

            if (error) throw error
            return data as any[] // Will be typed as EnrollmentWithUser[]
        },
        enabled: !!courseId,
    })
}

export function useUpdateEnrollmentStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            enrollmentId,
            status,
            expiryDate
        }: {
            enrollmentId: string
            status: string
            expiryDate?: string | null
        }) => {
            const updateData: any = {
                status
            }

            if (expiryDate !== undefined) {
                updateData.expiry_date = expiryDate
            }

            const { data, error } = await supabase
                .from(TABLES.ENROLLMENTS)
                .update(updateData)
                .eq('id', enrollmentId)
                .select()
                .single()

            if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned (enrollment not found)

            if (!data) throw new Error('Enrollment not found or update failed')
            return data
        },
        onSuccess: () => {
            // Invalidate and refetch enrollment queries
            queryClient.invalidateQueries({ queryKey: ['course-enrollments'] })
            queryClient.invalidateQueries({ queryKey: ['enrollments'] })
            queryClient.invalidateQueries({ queryKey: ['enrollment-status'] })
            queryClient.invalidateQueries({ queryKey: ['enrollment-details'] })
            queryClient.invalidateQueries({ queryKey: ['admin-pending-enrollments'] })
        },
    })
}

export function useDeleteEnrollment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (enrollmentId: string) => {
            const { error } = await supabase
                .from(TABLES.ENROLLMENTS)
                .delete()
                .eq('id', enrollmentId)

            if (error) throw error
        },
        onSuccess: () => {
            // Invalidate and refetch enrollment queries
            queryClient.invalidateQueries({ queryKey: ['course-enrollments'] })
            queryClient.invalidateQueries({ queryKey: ['enrollments'] })
            queryClient.invalidateQueries({ queryKey: ['enrollment-status'] })
            queryClient.invalidateQueries({ queryKey: ['enrollment-details'] })
            queryClient.invalidateQueries({ queryKey: ['admin-pending-enrollments'] })
        },
    })
}
export function useAdminPendingEnrollments() {
    return useQuery({
        queryKey: ['admin-pending-enrollments'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from(TABLES.ENROLLMENTS)
                .select(`
                    id,
                    user_id,
                    course_id,
                    status,
                    enrolled_at,
                    course:courses(title),
                    profile:profiles!enrollments_user_id_fkey(full_name, username, email)
                `)
                .eq('status', 'pending')
                .order('enrolled_at', { ascending: false })

            if (error) throw error
            return data || []
        },
    })
}

export function useBulkUpdateEnrollmentStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            enrollmentIds,
            status,
            expiryDate
        }: {
            enrollmentIds: string[]
            status: string
            expiryDate?: string | null
        }) => {
            // Import validation on demand to avoid circular dependencies
            const { validateBulkOperation } = await import('../lib/validation')

            // Validate inputs
            const validation = validateBulkOperation(enrollmentIds, status)
            if (!validation.isValid) {
                throw new Error(validation.error || 'Invalid input')
            }
            const updateData: any = {
                status
            }

            if (expiryDate !== undefined) {
                updateData.expiry_date = expiryDate
            }

            const { data, error } = await supabase
                .from(TABLES.ENROLLMENTS)
                .update(updateData)
                .in('id', enrollmentIds)
                .select()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            // Invalidate all enrollment-related queries
            queryClient.invalidateQueries({ queryKey: ['enrollments'] })
            queryClient.invalidateQueries({ queryKey: ['course-enrollments'] })
            queryClient.invalidateQueries({ queryKey: ['admin-pending-enrollments'] })
        },
    })
}
