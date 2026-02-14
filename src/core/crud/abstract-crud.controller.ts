import { Body, Get, Post, Put, Delete, Param } from '@nestjs/common';



import { ICrudService } from '../../shared/interfaces/crud.interfaces';
import { ApiMessage } from '../../shared/middlewares/decorators/api-message';


export abstract class CrudController<C, U, R> {
    protected constructor(protected readonly service: ICrudService<C, U, R>) {
    }


    @ApiMessage(`create`)
    @Post()
    create(@Body() data: C) {

        return this.service.Create(data);

    }

    @ApiMessage(`update`)
    @Put(':id')
    update(@Param('id') id: string, @Body() data: U) {

        return this.service.Update(id, data);

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