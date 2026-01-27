import { Injectable } from '@nestjs/common';
import { CrudRepository } from '../../../crud/abstract.crud.repository';
import { IPrismaService } from './prisma.service';

@Injectable()
export class PrismaCrudRepository<ModelName extends keyof IPrismaService['prisma'], C, U, R>
    implements CrudRepository<C, U, R> {
    constructor(protected readonly prismaSv: IPrismaService, protected readonly model: ModelName) {

    }

    protected get prismaModel() {
        if (!this.prismaSv?.prisma) {

            throw new Error('Prisma not initialized!');
        }
        return this.prismaSv.prisma[this.model] as any;
    }


    async Create(data: C, returnObjectParams: any): Promise<R | null> {
        try {
            const selectObj = returnObjectParams ?? {};
            const responseData = await this.prismaModel.create({ data, select: selectObj });
            return responseData;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async Update(id: string, data: U, returnObjectParams: any): Promise<R | null> {
        try {
            return await this.prismaModel.update({ where: { id }, data, select: returnObjectParams });
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async Delete(id: string, returnObjectParams: any): Promise<R | null> {
        try {
            return await this.prismaModel.delete({ where: { id }, select: returnObjectParams });
        } catch (error) {
            console.log(error);
            return null;
        }

    }

    async FindOne(id: string, returnObjectParams: any): Promise<R | null> {
        try {
            return await this.prismaModel.findUnique({ where: { id }, select: returnObjectParams });
        } catch (error) {
            console.log(error);
            return null;
        }

    }

    async FindMany(returnObjectParams: any, query?: any, pageIndex?: number, pagination?: number): Promise<R[]> {
        try {
            const paginationDefault: number = pagination ?? 10;
            const skip = pageIndex ? paginationDefault * pageIndex : 0;
            if (skip) {
                if (query) {
                    return await this.prismaModel.findMany({
                        where: query,
                        select: returnObjectParams,
                        take: paginationDefault,
                        skip,
                    });
                }
                return await this.prismaModel.findMany({
                    where: {},
                    select: returnObjectParams,
                    take: paginationDefault,
                    skip,
                });
            }
            if (query) {
                return await this.prismaModel.findMany({
                    where: query,
                    select: returnObjectParams
                });
            }
            return await this.prismaModel.findMany({
                where: {},
                select: returnObjectParams
            });
        } catch (error) {
            console.log(error);
            return [];
        }

    }

    async CreateMany(data: C[], includeParams: any, query?: any): Promise<R[] | (Awaited<R> | null)[]> {

        return await Promise.all(data.map(d => this.Create(d, includeParams)));
    }
    async UpdateMany(data: U[], includeParams: any, query?: any): Promise<R[] | (Awaited<R> | null)[]> {
        return await Promise.all(data.map((d) => this.Update((d as any).id, d, includeParams)));
    }

    async DeleteMany(includeParams: any, query?: any): Promise<R[] | (Awaited<R> | null)[]> {
        try {
            return await this.prismaModel.deleteMany({
                where: query,
                select: includeParams
            });
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async Search(filter: Partial<R>, includeParams: any): Promise<R[] | (Awaited<R> | null)[]> {
        try {
            return await this.prismaModel.findMany({
                where: filter,
                select: includeParams,
            });
        } catch (error) {
            console.log(error);
            return [];

        }
    }
} 