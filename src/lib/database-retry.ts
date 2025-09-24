/**
 * Simple retry mechanism for database operations
 * Used across all API endpoints to handle timeouts and connection issues
 */

export async function retryDatabaseOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation()
        } catch (error) {
            lastError = error as Error
            console.log(`Database operation attempt ${attempt} failed:`, error)

            if (attempt === maxAttempts) {
                throw lastError
            }

            // Exponential backoff: delay * attempt (1s, 2s, 3s...)
            await new Promise(resolve => setTimeout(resolve, delay * attempt))
        }
    }

    throw lastError!
}

/**
 * Retry with custom configuration for different operation types
 */
export const retryConfigs = {
    // Quick operations (count, findUnique)
    quick: {
        maxAttempts: 2,
        delay: 500
    },

    // Normal operations (findMany, create)
    normal: {
        maxAttempts: 3,
        delay: 1000
    },

    // Heavy operations (complex queries, bulk operations)
    heavy: {
        maxAttempts: 5,
        delay: 2000
    }
}

/**
 * Retry with predefined configuration
 */
export async function retryWithConfig<T>(
    operation: () => Promise<T>,
    config: keyof typeof retryConfigs = 'normal'
): Promise<T> {
    const { maxAttempts, delay } = retryConfigs[config]
    return retryDatabaseOperation(operation, maxAttempts, delay)
}
