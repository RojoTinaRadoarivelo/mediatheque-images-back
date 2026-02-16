import { Injectable } from "@nestjs/common";
import { PrismaCrudRepository } from "../../core/configs/interfaces/prisma-ripository/prisma.repository";
import { IPrismaService } from "../../core/configs/interfaces/prisma-ripository/prisma.service";
import { CreateTagDto, UpdateTagDto } from "./DTOs/tags.dto";
import { Tags } from "./tags.type";



@Injectable()
export class TagRepository extends PrismaCrudRepository<'tags', CreateTagDto, UpdateTagDto, Tags> {
    constructor(prisma: IPrismaService) { super(prisma, 'tags'); }
    // override possible async findMany(args?: any) { return super.findMany({ ...args, where: { isActive: true }, }); } 
} 