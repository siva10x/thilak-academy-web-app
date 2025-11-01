import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import type { Video } from '../types'

interface VideoPlayerProps {
    video: Video
    isOpen: boolean
    onClose: () => void
}

export function VideoPlayer({ video, isOpen, onClose }: VideoPlayerProps) {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true)
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden'
        } else {
            // Restore body scroll when modal is closed
            document.body.style.overflow = 'unset'
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    const getVimeoEmbedUrl = (vimeoId: string) => {
        return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&color=2563eb&title=0&byline=0&portrait=0`
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-2 md:p-4"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-4xl max-h-[95vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-3 md:p-4 border-b bg-white flex-shrink-0">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base md:text-xl font-semibold text-gray-900 truncate">
                            {video.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-3 md:ml-4 flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Close video"
                    >
                        <XMarkIcon className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
                    </button>
                </div>

                {/* Video Content */}
                <div className="relative flex-1 min-h-0">
                    {video.vimeo_id ? (
                        <div className="relative bg-black h-full">
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-primary-600 mx-auto mb-2 md:mb-4"></div>
                                        <p className="text-sm md:text-base text-gray-600">Loading video...</p>
                                    </div>
                                </div>
                            )}
                            <iframe
                                src={getVimeoEmbedUrl(video.vimeo_id)}
                                className="w-full h-full min-h-[200px] md:min-h-[400px]"
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                                onLoad={() => setIsLoading(false)}
                                title={video.title}
                            />
                        </div>
                    ) : (
                        <div className="h-full min-h-[200px] md:min-h-[400px] flex items-center justify-center bg-gray-100">
                            <p className="text-gray-600">Video not available</p>
                        </div>
                    )}
                </div>

                {/* Video Description */}
                {video.description && (
                    <div className="p-3 md:p-4 border-t bg-gray-50 flex-shrink-0 max-h-32 overflow-y-auto">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {video.description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}