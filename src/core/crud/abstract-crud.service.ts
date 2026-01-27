import { ICrudService } from "../../shared/interfaces/crud.interfaces";
import { CrudRepository } from "./abstract.crud.repository";

export abstract class CrudService<C, U, R> implements ICrudService<C, U, R> {
    constructor(protected readonly repository: CrudRepository<C, U, R>) { }

    // default
    protected includeParams: any = { id: true };
    // crud include
    protected createIncludeParams: any = { id: true };
    protected updateIncludeParams: any = { id: true };
    protected deleteIncludeParams: any = { id: true };
    protected searchIncludeParams: any = { id: true };
    protected listFilterIncludeParams: any = { id: true };


    async Create(data: C, query?: any): Promise<R | null> {
        const includeParams = this.createIncludeParams ?? this.includeParams;
        return await this.repository.Create(data, includeParams, query);
    }
    async Update(id: string, data: U, query?: any): Promise<R | null> {
        const includeParams = this.updateIncludeParams ?? this.includeParams;
        return await this.repository.Update(id, includeParams, data);

    }
    async Delete(id: string, query?: any): Promise<R | null> {
        const includeParams = this.deleteIncludeParams ?? this.includeParams;
        return await this.repository.Delete(id, includeParams);
    }
    async CreateMany(data: C[], query?: any): Promise<R[] | (Awaited<R> | null)[]> {
        const includeParams = this.listFilterIncludeParams ?? this.includeParams;
        return await this.repository.CreateMany(data, includeParams);
    }
    async UpdateMany(data: U[], query?: any): Promise<R[] | (Awaited<R> | null)[]> {
        const includeParams = this.listFilterIncludeParams ?? this.includeParams;
        return await this.repository.UpdateMany(data, includeParams);
    }
    async FindMany(pagination?: number, step?: number): Promise<R[] | (Awaited<R> | null)[]> {
        const includeParams = this.includeParams ?? this.listFilterIncludeParams;
        return await this.repository.FindMany(includeParams);
    }
    async DeleteMany(ids: string[], query?: any): Promise<R[] | (Awaited<R> | null)[]> {
        const includeParams = this.listFilterIncludeParams ?? this.includeParams;
        return await this.repository.DeleteMany(ids, includeParams);
    }

    async Search(filter: Partial<R>): Promise<R[] | (Awaited<R> | null)[]> {
        const includeParams = this.listFilterIncludeParams ?? this.includeParams;
        return await this.repository.FindMany(includeParams);
    }
} 