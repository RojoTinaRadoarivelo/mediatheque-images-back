export interface CrudRepository<C, U, R> {
    Create(data: C, returnObjectParams: any, query?: any): Promise<R | null>
    CreateMany(data: C[], returnObjectParams: any, query?: any): Promise<R[] | (Awaited<R> | null)[]>;
    Update(id: string, data: U, returnObjectParams: any, query?: any): Promise<R | null>;
    UpdateMany(data: U[], returnObjectParams: any, query?: any): Promise<R[] | (Awaited<R> | null)[]>;
    Delete(id: string, returnObjectParams: any, query?: any): Promise<R | null>;
    DeleteMany(ids: string[], returnObjectParams: any, query?: any): Promise<R[] | (Awaited<R> | null)[]>;
    FindMany(returnObjectParams: any, query?: any, pagination?: number, step?: number): Promise<R[] | (Awaited<R> | null)[]>;
} 