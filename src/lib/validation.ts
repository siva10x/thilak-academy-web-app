// Input validation utilities for security
export function validateEnrollmentStatus(status: string): boolean {
    const validStatuses = ['pending', 'active', 'suspended', 'expired']
    return validStatuses.includes(status.toLowerCase())
}

export function validateUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(id)
}

export function sanitizeInput(input: string): string {
    return input.trim().slice(0, 255) // Prevent long inputs
}

export function validateBulkOperation(enrollmentIds: string[], status: string): { isValid: boolean, error?: string } {
    if (!Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
        return { isValid: false, error: 'No enrollments selected' }
    }

    if (enrollmentIds.length > 100) {
        return { isValid: false, error: 'Too many enrollments selected (max 100)' }
    }

    for (const id of enrollmentIds) {
        if (!validateUUID(id)) {
            return { isValid: false, error: 'Invalid enrollment ID format' }
        }
    }

    if (!validateEnrollmentStatus(status)) {
        return { isValid: false, error: 'Invalid status' }
    }

    return { isValid: true }
}