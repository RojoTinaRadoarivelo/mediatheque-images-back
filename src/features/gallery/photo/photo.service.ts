import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IPrismaService } from '../../../core/configs/interfaces/prisma-ripository/prisma.service';
import { CreatePhotoDto, UpdatePhotoDto } from '../DTOs/photo.dto';
import { IResponse } from '../../../shared/interfaces/responses.interfaces';
import { Photos } from './photos.type';
import { RemoveFile } from '../../../utils/files.util';

@Injectable()
export class PhotoService {
    private readonly photosPrisma: any;
    private readonly selectFields: any = {
        id: true,
        name: true,
        path: true,
        createdAt: true,
        updatedAt: true,
    };
    constructor(private readonly _dbService: IPrismaService) {
        this.photosPrisma = _dbService.prisma.photos;
    }

    async createPhoto(data: CreatePhotoDto) {
        let response: IResponse<Photos | null>;
        try {
            const responseData = await this.photosPrisma.create({
                data: {
                    ...data,
                    isDeleted: false,
                },
                select: this.selectFields,
            });
            if (!responseData) {
                throw new BadRequestException('There was an error creating the photo!');
            }
            response = {
                statusCode: HttpStatus.CREATED,
                data: responseData,
            };
            // responseData
            return response;
        } catch (error) {
            if (error instanceof BadRequestException) {
                response = {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: error.message,
                };
            } else {
                response = {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message,
                };
            }
            return response;

        }

    }
    async updatePhoto(id: string, data: UpdatePhotoDto) {
        let response: IResponse<Photos | null>;
        try {
            const responseData = await this.photosPrisma.update({
                where: { id, isDeleted: false },
                data: {
                    ...data,
                    isDeleted: false,
                },
                select: this.selectFields,
            });
            if (!responseData) {
                throw new BadRequestException('There was an error updating the photo!');
            }
            response = {
                statusCode: HttpStatus.CREATED,
                data: responseData,
            };
            return response;
        } catch (error) {
            if (error instanceof BadRequestException) {
                response = {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: error.message,
                };
            } else {
                response = {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message,
                };
            }
            return response;

        }

    }

    async deletePhoto(id: string, path: string) {
        try {
            const deleted = await this.photosPrisma.delete({ where: { id } });
            if (deleted) {
                RemoveFile(path);
                return {
                    statusCode: HttpStatus.OK,
                    message: "Photo deleted successfuly.",
                }
            } else throw new InternalServerErrorException("There was an error while deleting the photo");
        } catch (error) {
            console.log(error.message);
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
            };
        }

    }
}
