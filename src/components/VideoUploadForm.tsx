import React, { useState, useEffect } from 'react'
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { useCreateVideo, useAddVideoToCourse, useUpdateVideo } from '../hooks/useCourses'
import type { Video } from '../types'

interface VideoUploadFormProps {
    courseId: string
    isOpen: boolean
    onClose: () => void
    editVideo?: Video | null
    isEditMode?: boolean
}

export function VideoUploadForm({ courseId, isOpen, onClose, editVideo = null, isEditMode = false }: VideoUploadFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnailUrl: '',
        vimeoId: '',
        previewEnabled: false
    })

    const createVideoMutation = useCreateVideo()
    const updateVideoMutation = useUpdateVideo()
    const addVideoToCourseMutation = useAddVideoToCourse()

    // Populate form with existing video data when in edit mode
    useEffect(() => {
        if (isEditMode && editVideo && isOpen) {
            setFormData({
                title: editVideo.title || '',
                description: editVideo.description || '',
                thumbnailUrl: editVideo.thumbnail_url || '',
                vimeoId: editVideo.vimeo_id || '',
                previewEnabled: false // This would need to come from course_videos table
            })
        } else if (!isEditMode && isOpen) {
            // Reset form when opening in create mode
            setFormData({
                title: '',
                description: '',
                thumbnailUrl: '',
                vimeoId: '',
                previewEnabled: false
            })
        }
    }, [isEditMode, editVideo, isOpen])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim() || !formData.vimeoId.trim()) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            if (isEditMode && editVideo) {
                // Update existing video
                await updateVideoMutation.mutateAsync({
                    videoId: editVideo.id,
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    thumbnailUrl: formData.thumbnailUrl.trim(),
                    vimeoId: formData.vimeoId.trim()
                })

                toast.success('Video updated successfully!')
            } else {
                // Create new video
                const video = await createVideoMutation.mutateAsync({
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    thumbnailUrl: formData.thumbnailUrl.trim(),
                    vimeoId: formData.vimeoId.trim()
                })

                // Then add it to the course
                await addVideoToCourseMutation.mutateAsync({
                    courseId,
                    videoId: video.id,
                    previewEnabled: formData.previewEnabled
                })

                toast.success('Video uploaded successfully!')
            }

            // Reset form and close modal
            setFormData({
                title: '',
                description: '',
                thumbnailUrl: '',
                vimeoId: '',
                previewEnabled: false
            })
            onClose()
        } catch (error) {
            console.error('Error saving video:', error)
            toast.error(`Failed to ${isEditMode ? 'update' : 'upload'} video. Please try again.`)
        }
    }

    const isLoading = createVideoMutation.isPending || addVideoToCourseMutation.isPending || updateVideoMutation.isPending

    // Prevent modal from closing on tab visibility changes
    useEffect(() => {
        if (!isOpen) return

        const handleVisibilityChange = (e: Event) => {
            e.preventDefault()
            // Prevent any default behavior that might close the modal
        }

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (formData.title.trim() || formData.description.trim() || formData.vimeoId.trim()) {
                e.preventDefault()
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
                return e.returnValue
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [isOpen, formData])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
                // Only close if clicking the backdrop, not the modal content
                if (e.target === e.currentTarget) {
                    onClose()
                }
            }}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {isEditMode ? 'Edit Video Details' : 'Upload Video'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Video Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Video Title *
                        </label>
                        <Input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter video title"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {/* Video Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Video Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter video description"
                            disabled={isLoading}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Thumbnail URL */}
                    <div>
                        <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-2">
                            Thumbnail URL
                        </label>
                        <Input
                            id="thumbnailUrl"
                            name="thumbnailUrl"
                            type="url"
                            value={formData.thumbnailUrl}
                            onChange={handleInputChange}
                            placeholder="https://example.com/thumbnail.jpg"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Vimeo ID */}
                    <div>
                        <label htmlFor="vimeoId" className="block text-sm font-medium text-gray-700 mb-2">
                            Vimeo ID *
                        </label>
                        <Input
                            id="vimeoId"
                            name="vimeoId"
                            type="text"
                            value={formData.vimeoId}
                            onChange={handleInputChange}
                            placeholder="123456789"
                            disabled={isLoading}
                            required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Enter the Vimeo video ID (numbers only)
                        </p>
                    </div>

                    {/* Preview Enabled */}
                    <div className="flex items-center">
                        <input
                            id="previewEnabled"
                            name="previewEnabled"
                            type="checkbox"
                            checked={formData.previewEnabled}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="previewEnabled" className="ml-2 block text-sm text-gray-700">
                            Enable free preview for this video
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {isEditMode ? 'Updating...' : 'Uploading...'}
                                </>
                            ) : (
                                <>
                                    <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                                    {isEditMode ? 'Update Video' : 'Upload Video'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}