import { Body, Get, Post, Put, Delete, Param, UsePipes } from '@nestjs/common';



import { ICrudService } from '../../shared/interfaces/crud.interfaces';
import { ApiMessage } from '../../shared/middlewares/decorators/api-message';
import { GenericDtoValidatorPipe } from '../../shared/middlewares/pipes/generic-dto-validator.pipe';


export abstract class CrudController<C, U, R> {
    protected constructor(
        protected readonly service: ICrudService<C, U, R>
    ) {
    }

    protected abstract getCreateDto(): new (...args: any[]) => object;
    protected abstract getUpdateDto(): new (...args: any[]) => object;

    @ApiMessage(`create`)
    @Post()
    async create(@Body() data: C) {
        const dtoClass = this.getCreateDto();
        const validated = await new GenericDtoValidatorPipe(dtoClass, ['create']).transform(data, { type: 'body' } as any);
        return this.service.Create(validated as C);

    }

    @ApiMessage(`update`)
    @Put(':id')
    async update(@Param('id') id: string, @Body() data: U) {
        const dtoClass = this.getUpdateDto();
        const validated = await new GenericDtoValidatorPipe(dtoClass, ['update']).transform(data, { type: 'body' } as any);
        return this.service.Update(id, validated as U);

    }

    @ApiMessage(`delete`)
    @Delete(':id')
    delete(@Param('id') id: string) {

        return this.service.Delete(id);

    }

    @ApiMessage(`list`)
    @Get()
    findMany() {

        return this.service.FindMany();

    }
}