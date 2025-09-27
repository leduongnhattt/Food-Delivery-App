import { BaseService } from '@/lib/base-service'
import { requestJson } from '@/lib/http-client'

export interface CategoryDto {
    id: string
    name: string
    description?: string | null
    foodCount?: number
}

export class CategoryService extends BaseService {
    constructor() {
        super('/api/categories')
    }

    static async getAll(): Promise<CategoryDto[]> {
        try {
            const response = await requestJson<{ categories: CategoryDto[] }>('/api/categories', {
                method: 'GET',
                cache: 'no-store'
            })
            return response.categories ?? []
        } catch (error) {
            console.error('Error fetching categories:', error)
            return []
        }
    }
}
