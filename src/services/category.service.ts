export interface CategoryDto {
    id: string
    name: string
    description?: string | null
    foodCount?: number
}

export class CategoryService {
    private static baseUrl = '/api/categories'

    static async getAll(): Promise<CategoryDto[]> {
        const res = await fetch(this.baseUrl, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch categories')
        const data = await res.json() as { categories: CategoryDto[] }
        return data.categories ?? []
    }
}
