export interface ICrudService<C, U, R> {
    Create(data: C, query?: any): Promise<R | null>;
    Update(id: string, data: U, query?: any): Promise<R | null>;
    Delete(id: string, query?: any): Promise<R | null>;
    CreateMany(data: C[], query?: any): Promise<R[] | (Awaited<R> | null)[]>;
    UpdateMany(data: U[], query?: any): Promise<R[] | (Awaited<R> | null)[]>;
    FindMany(pagination?: number, step?: number): Promise<R[] | (Awaited<R> | null)[]>;
    DeleteMany(ids: string[], query?: any): Promise<R[] | (Awaited<R> | null)[]>;
    Search(filter: Partial<R>, pagination?: number, step?: number): Promise<R[] | (Awaited<R> | null)[]>;
}