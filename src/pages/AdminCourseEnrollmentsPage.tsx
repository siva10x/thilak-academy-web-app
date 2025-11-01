import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, HomeIcon, ChevronRightIcon, UserIcon, CheckCircleIcon, XCircleIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { useCourse, useCourseEnrollments, useDeleteEnrollment, useUpdateEnrollmentStatus, useBulkUpdateEnrollmentStatus } from '../hooks/useCourses'
import { useIsAdmin } from '../hooks/useAdmin'
import { Layout } from '../components/layout/Layout'
import { LoadingPage } from '../components/ui/Loading'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import type { EnrollmentWithUser } from '../types'

export function AdminCourseEnrollmentsPage() {
    const { courseId } = useParams<{ courseId: string }>()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [selectedEnrollment, setSelectedEnrollment] = useState<string | null>(null)
    const [selectedEnrollments, setSelectedEnrollments] = useState<Set<string>>(new Set())
    const [bulkStatus, setBulkStatus] = useState<string>('')
    const [showBulkConfirm, setShowBulkConfirm] = useState(false)

    const { data: isAdmin, isLoading: adminLoading } = useIsAdmin(user?.id)
    const { data: course, isLoading: courseLoading } = useCourse(courseId!)
    const { data: enrollments = [], isLoading: enrollmentsLoading, refetch } = useCourseEnrollments(courseId!)
    const updateEnrollmentMutation = useUpdateEnrollmentStatus()
    const deleteEnrollmentMutation = useDeleteEnrollment()
    const bulkUpdateMutation = useBulkUpdateEnrollmentStatus()

    const handleBack = () => {
        navigate('/dashboard')
    }

    const handleUpdateStatus = async (enrollmentId: string, newStatus: string) => {
        setSelectedEnrollment(enrollmentId)
        try {
            await updateEnrollmentMutation.mutateAsync({
                enrollmentId,
                status: newStatus,
                expiryDate: newStatus === 'expired' ? new Date().toISOString() : null
            })
            toast.success(`Enrollment status updated to ${newStatus}`)
            await refetch()
        } catch (error) {
            toast.error('Failed to update enrollment status')
            console.error('Update error:', error)
        } finally {
            setSelectedEnrollment(null)
        }
    }

    const handleDeleteEnrollment = async (enrollmentId: string, studentName: string) => {
        if (!confirm(`Are you sure you want to delete the enrollment for ${studentName}? This action cannot be undone.`)) {
            return
        }

        setSelectedEnrollment(enrollmentId)
        try {
            await deleteEnrollmentMutation.mutateAsync(enrollmentId)
            toast.success('Enrollment deleted successfully')
            await refetch()
        } catch (error) {
            toast.error('Failed to delete enrollment')
            console.error('Delete error:', error)
        } finally {
            setSelectedEnrollment(null)
        }
    }

    const handleSelectAll = () => {
        if (selectedEnrollments.size === enrollments.length) {
            setSelectedEnrollments(new Set())
        } else {
            setSelectedEnrollments(new Set(enrollments.map(e => e.id)))
        }
    }

    const handleSelectEnrollment = (enrollmentId: string) => {
        const newSelected = new Set(selectedEnrollments)
        if (newSelected.has(enrollmentId)) {
            newSelected.delete(enrollmentId)
        } else {
            newSelected.add(enrollmentId)
        }
        setSelectedEnrollments(newSelected)
    }

    const handleBulkUpdate = () => {
        if (selectedEnrollments.size === 0 || !bulkStatus) {
            toast.error('Please select enrollments and status')
            return
        }
        setShowBulkConfirm(true)
    }

    const confirmBulkUpdate = async () => {
        try {
            await bulkUpdateMutation.mutateAsync({
                enrollmentIds: Array.from(selectedEnrollments),
                status: bulkStatus,
                expiryDate: bulkStatus === 'expired' ? new Date().toISOString() : null
            })
            toast.success(`Updated ${selectedEnrollments.size} enrollments successfully`)
            setSelectedEnrollments(new Set())
            setBulkStatus('')
            setShowBulkConfirm(false)
            await refetch()
        } catch (error) {
            toast.error('Failed to update enrollments')
            console.error('Bulk update error:', error)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircleIcon className="h-5 w-5 text-green-600" />
            case 'suspended':
                return <XCircleIcon className="h-5 w-5 text-red-600" />
            case 'expired':
                return <ClockIcon className="h-5 w-5 text-orange-600" />
            default:
                return <UserIcon className="h-5 w-5 text-gray-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800'
            case 'suspended':
                return 'bg-red-100 text-red-800'
            case 'expired':
                return 'bg-orange-100 text-orange-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (adminLoading || courseLoading) {
        return <LoadingPage message="Loading admin panel..." />
    }

    if (!isAdmin) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-6">You don't have admin privileges to access this page.</p>
                    <Button onClick={handleBack}>
                        Back to Dashboard
                    </Button>
                </div>
            </Layout>
        )
    }

    if (!course) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
                    <Button onClick={handleBack}>
                        Back to Dashboard
                    </Button>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="space-y-4 md:space-y-6">
                {/* Navigation Header */}
                <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-3 md:p-4">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleBack}
                            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            aria-label="Go back"
                        >
                            <ArrowLeftIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                        </button>
                        <div className="flex items-center text-sm md:text-base text-gray-600">
                            <Link to="/dashboard" className="flex items-center hover:text-primary-600 transition-colors">
                                <HomeIcon className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Dashboard</span>
                                <span className="sm:hidden">Home</span>
                            </Link>
                            <ChevronRightIcon className="h-4 w-4 mx-1 md:mx-2 text-gray-400" />
                            <Link to={`/course/${courseId}`} className="hover:text-primary-600 transition-colors truncate max-w-32 md:max-w-none">
                                {course.title}
                            </Link>
                            <ChevronRightIcon className="h-4 w-4 mx-1 md:mx-2 text-gray-400" />
                            <span className="text-gray-900 font-medium">Admin: Enrollments</span>
                        </div>
                    </div>
                </div>

                {/* Page Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                Course Enrollments
                            </h1>
                            <p className="text-gray-600">
                                Manage enrollments for "{course.title}"
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary-600">
                                {enrollments.length}
                            </div>
                            <div className="text-sm text-gray-600">
                                Total Enrollments
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enrollments List */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                            <h3 className="text-lg font-semibold">Enrolled Students</h3>

                            {/* Bulk Actions */}
                            {enrollments.length > 0 && (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedEnrollments.size === enrollments.length && enrollments.length > 0}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-600">
                                            {selectedEnrollments.size > 0 ? `${selectedEnrollments.size} selected` : 'Select all'}
                                        </span>
                                    </div>

                                    {selectedEnrollments.size > 0 && (
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                            <select
                                                value={bulkStatus}
                                                onChange={(e) => setBulkStatus(e.target.value)}
                                                className="block w-full sm:w-auto px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            >
                                                <option value="">Select status...</option>
                                                <option value="active">Active</option>
                                                <option value="pending">Pending</option>
                                                <option value="suspended">Suspended</option>
                                                <option value="expired">Expired</option>
                                            </select>
                                            <Button
                                                onClick={handleBulkUpdate}
                                                disabled={!bulkStatus || bulkUpdateMutation.isPending}
                                                size="sm"
                                                className="w-full sm:w-auto"
                                            >
                                                {bulkUpdateMutation.isPending ? 'Updating...' : 'Update Selected'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 md:p-6">
                        {enrollmentsLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading enrollments...</p>
                            </div>
                        ) : enrollments.length > 0 ? (
                            <div className="space-y-4">
                                {enrollments.map((enrollment: EnrollmentWithUser) => (
                                    <Card key={enrollment.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEnrollments.has(enrollment.id)}
                                                        onChange={() => handleSelectEnrollment(enrollment.id)}
                                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                    />
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                        <UserIcon className="h-5 w-5 text-primary-600" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900">
                                                        {enrollment.profile?.full_name || enrollment.profile?.username || 'Unknown User'}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {enrollment.profile?.email || 'No email'}
                                                    </p>
                                                    <div className="flex items-center space-x-4 mt-1">
                                                        <span className="text-xs text-gray-500">
                                                            Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                                        </span>
                                                        {enrollment.expiry_date && (
                                                            <span className="text-xs text-gray-500">
                                                                Expires: {new Date(enrollment.expiry_date).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                {/* Status Badge */}
                                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                                                    {getStatusIcon(enrollment.status)}
                                                    <span className="ml-1 capitalize">{enrollment.status}</span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex space-x-1">
                                                    {enrollment.status !== 'active' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleUpdateStatus(enrollment.id, 'active')}
                                                            loading={selectedEnrollment === enrollment.id}
                                                            disabled={updateEnrollmentMutation.isPending}
                                                        >
                                                            Activate
                                                        </Button>
                                                    )}
                                                    {enrollment.status !== 'suspended' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleUpdateStatus(enrollment.id, 'suspended')}
                                                            loading={selectedEnrollment === enrollment.id}
                                                            disabled={updateEnrollmentMutation.isPending}
                                                        >
                                                            Suspend
                                                        </Button>
                                                    )}
                                                    {enrollment.status !== 'expired' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleUpdateStatus(enrollment.id, 'expired')}
                                                            loading={selectedEnrollment === enrollment.id}
                                                            disabled={updateEnrollmentMutation.isPending}
                                                        >
                                                            Expire
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDeleteEnrollment(
                                                            enrollment.id,
                                                            enrollment.profile?.full_name || enrollment.profile?.username || 'Unknown User'
                                                        )}
                                                        loading={selectedEnrollment === enrollment.id}
                                                        disabled={deleteEnrollmentMutation.isPending || updateEnrollmentMutation.isPending}
                                                        className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-sm md:text-base">No enrollments found for this course</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bulk Update Confirmation Dialog */}
            {showBulkConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Confirm Bulk Update</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to update {selectedEnrollments.size} enrollment(s) to "{bulkStatus}" status?
                        </p>
                        <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowBulkConfirm(false)}
                                disabled={bulkUpdateMutation.isPending}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmBulkUpdate}
                                disabled={bulkUpdateMutation.isPending}
                                className="w-full sm:w-auto"
                            >
                                {bulkUpdateMutation.isPending ? 'Updating...' : 'Confirm'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    )
}