import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { IPrismaService } from '../../../core/configs/interfaces/prisma-ripository/prisma.service';
import { CreatePhotoDto, UpdatePhotoDto } from '../DTOs/photo.dto';
import { IResponse } from '../../../shared/interfaces/responses.interfaces';
import { Photos } from './photos.type';

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

    async getAllPhoto() {
        let response: IResponse<Photos[]>;
        try {
            const responseData = await this.photosPrisma.findMany({
                where: {
                    isDeleted: false,
                },
                select: this.selectFields,
            });
            response = {
                statusCode: HttpStatus.OK,
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
    async getFilteredPhotos(query: any) {
        let response: IResponse<Photos[]>;
        try {
            const { name, ...rest } = query;
            const ifCondition = name != undefined ? { name: { contains: name, mode: "insensitive" } } : { ...rest };
            const responseData = await this.photosPrisma.findMany({
                where: {
                    ...ifCondition,
                    isDeleted: false,
                },
                select: this.selectFields,
            });
            response = {
                statusCode: HttpStatus.OK,
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
    async getOnePhoto(id: string) {
        let response: IResponse<Photos | null>;
        try {
            const responseData = await this.photosPrisma.findFirst({
                where: {
                    id,
                    isDeleted: false,
                },
                select: this.selectFields,
            });
            if (!responseData) {
                throw new NotFoundException('Not found photo!');
            }
            response = {
                statusCode: HttpStatus.OK,
                data: responseData,
            };
            return response;
        } catch (error) {
            if (error instanceof NotFoundException) {
                response = {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: error.message,
                };
            } else if (error instanceof BadRequestException) {
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

    async moveToBinPhoto(id: string) {
        let response: IResponse<Photos | null>;
        try {
            const responseData = await this.photosPrisma.update({
                where: { id, isDeleted: false },
                data: {
                    isDeleted: true,
                },
                select: this.selectFields,
            });
            if (!responseData) {
                throw new BadRequestException('There was an error moving the photo to the bin!');
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

    async restoreFromBinPhoto(id: string) {
        let response: IResponse<Photos | null>;
        try {
            const responseData = await this.photosPrisma.update({
                where: { id, isDeleted: true },
                data: {
                    isDeleted: false,
                },
                select: this.selectFields,
            });
            if (!responseData) {
                throw new BadRequestException('There was an error restoring the photo from bin!');
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

    async deletePhoto(id: string) {
        let response: IResponse<Photos | null>;
        try {
            const responseData = await this.photosPrisma.delete({
                where: { id, isDeleted: true },
                select: this.selectFields,
            });
            if (!responseData) {
                throw new BadRequestException('There was an error deleting the photo!');
            }
            response = {
                statusCode: HttpStatus.CREATED,
                data: responseData,
            };
            // delete photo with the path
            return response;
        } catch (error) {
            if (error instanceof NotFoundException) {
                response = {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: error.message,
                };
            } else if (error instanceof BadRequestException) {
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
}
