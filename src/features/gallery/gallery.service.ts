import { BadRequestException, ConflictException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IPrismaService } from '../../core/configs/interfaces/prisma-ripository/prisma.service';
import { PhotoService } from './photo/photo.service';
import { CreateGalleryDto, UpdateGalleryDto } from './DTOs/gallery.dto';
import { IResponse } from '../../shared/interfaces/responses.interfaces';
import { Photos } from './photo/photos.type';
import { assertSingle } from '../../utils/interfaces/assert-single.utils';
import { DEFAULT_ERROR_MSG, PHOTO_ERROR_MESSAGE } from '../../auth/interfaces/error-messages';
import { Galleries } from './gallery.type';

@Injectable()
export class GalleryService {
    private readonly galleryPrisma: any;
    private readonly photoPrisma: any;
    private readonly selectFields: any = {
        id: true,
        photo: {
            select: {
                id: true,
                name: true,
                path: true,
                isDeleted: true
            }
        },
        user: {
            select: {
                id: true,
                email: true,
                userName: true,
                avatar: true,
                isDeleted: true
            }
        },
        tag: {
            select: {
                id: true,
                name: true,
                isDeleted: true
            }
        },
        createdAt: true,
        updatedAt: true,
    };

    constructor(
        private readonly _dbService: IPrismaService,
        private readonly _photoService: PhotoService
    ) {
        this.galleryPrisma = _dbService.prisma.taggedPhoto;
        this.photoPrisma = _dbService.prisma.photos;
    }

    async getAllPhoto() {
        const photoFiltered = await this.galleryPrisma.findMany({
            select: this.selectFields
        });
        return photoFiltered;
    }

    async getFilteredPhoto(query: any) {
        const { name, tagNames, userName, userId } = query;
        const photoName = name != undefined ? { photo: { name, mode: "insensitive" } } : undefined;
        const userNameCondition = userName != undefined ? {
            user: {
                userName,
                mode: "insensitive"
            }
        } : undefined;
        const userIdCondition = userId != undefined ? {
            user_id: userId
        } : undefined;
        const tagsConditions = tagNames != undefined ? {
            tag: {
                name: { in: tagNames, mode: "insensitive" }
            }
        } : undefined;
        const orCondition = { OR: [photoName, userIdCondition, userNameCondition, tagsConditions] };
        const photoFiltered = await this.galleryPrisma.findMany({
            where: {
                orCondition
            },
            select: this.selectFields
        });
        return photoFiltered;
    }

    async createPhoto(data: CreateGalleryDto): Promise<IResponse<any[]>> {
        let response: IResponse<any[]>;
        try {
            const { name, path, tags_id, user_id } = data;
            let responseData: any[] = [];
            // create photo
            const photoCreated = await this._photoService.createPhoto({ name, path });
            let photo: Photos | null;
            if (photoCreated) {
                photo = assertSingle(
                    photoCreated.data,
                    'Photo not found or invalid result'
                );
            } else {
                throw new InternalServerErrorException(DEFAULT_ERROR_MSG.unexpected)
            }
            if (photo) {
                // link together
                for (const tag_id of tags_id!) {
                    const photoTagged = await this.galleryPrisma.create({
                        data: {
                            photo_id: photo.id,
                            tag_id,
                            user_id
                        }
                    });
                    if (photoTagged) {
                        responseData.push(photoTagged)
                    } else throw new BadRequestException('Bad request while creating the photo');
                }
                return {
                    message: 'The photo was created successfuly!',
                    data: responseData ?? [],
                    statusCode: 200
                };
            } else {
                throw new NotFoundException(PHOTO_ERROR_MESSAGE.notfound);
            }

        } catch (error) {
            if (error instanceof NotFoundException) {
                response = {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: error.message,
                };
            } else if (error instanceof ConflictException) {
                response = {
                    statusCode: HttpStatus.CONFLICT,
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

    async updatePhoto(data: UpdateGalleryDto): Promise<IResponse<any[]>> {
        let response: IResponse<any[]>;
        try {
            const { name, path, photo_id, tags_id, user_id } = data;
            let responseData: any[] = [];
            // update photo
            const photoUpdated = await this._photoService.updatePhoto(photo_id!, { name, path });
            let photo: Photos | null;
            if (photoUpdated) {
                photo = assertSingle(
                    photoUpdated.data,
                    'Photo not found or invalid result'
                );
            } else {
                throw new InternalServerErrorException(DEFAULT_ERROR_MSG.unexpected)
            }
            if (photo) {
                // delete existing phototagged for the photo
                await this.galleryPrisma.deleteMany({
                    where: {
                        photo_id: photo.id,
                        user_id
                    }
                })
                // link together            
                for (const tag_id of tags_id!) {
                    const photoTagged = await this.galleryPrisma.create({
                        data: {
                            photo_id: photo.id,
                            tag_id,
                            user_id
                        }
                    });
                    if (photoTagged) {
                        responseData.push(photoTagged)
                    } else throw new BadRequestException('Bad request while updating the photo');
                }
                return {
                    message: 'The photo was updated successfuly!',
                    data: responseData ?? [],
                    statusCode: 200
                };
            } else {
                throw new NotFoundException(PHOTO_ERROR_MESSAGE.notfound);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                response = {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: error.message,
                };
            } else if (error instanceof ConflictException) {
                response = {
                    statusCode: HttpStatus.CONFLICT,
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
    async moveToBinPhoto(id: string) {
        let response: IResponse<Galleries | null>;
        try {
            const responseData = await this.galleryPrisma.update({
                where: { id, isDeleted: false },
                data: { isDeleted: true },
                select: this.selectFields
            })
            if (responseData) {
                return {
                    message: 'The photo was moved to bin successfuly!',
                    data: responseData ?? null,
                    statusCode: 200
                };
            } else throw new BadRequestException('Bad request while moving the photo to bin');

        } catch (error) {
            if (error instanceof NotFoundException) {
                response = {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: error.message,
                };
            } else if (error instanceof ConflictException) {
                response = {
                    statusCode: HttpStatus.CONFLICT,
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

    async restoreFromBinPhoto(id: string) {
        let response: IResponse<Galleries | null>;
        try {
            const responseData = await this.galleryPrisma.update({
                where: { id, isDeleted: true },
                data: { isDeleted: false },
                select: this.selectFields
            })
            if (responseData) {
                return {
                    message: 'The photo was restored from bin successfuly!',
                    data: responseData ?? null,
                    statusCode: 200
                };
            }
            else throw new BadRequestException('Bad request while restoring the photo from bin');
        } catch (error) {
            if (error instanceof NotFoundException) {
                response = {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: error.message,
                };
            } else if (error instanceof ConflictException) {
                response = {
                    statusCode: HttpStatus.CONFLICT,
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

    async deletePhoto(id: string) {
        let response: IResponse<Galleries | null>;
        try {
            const responseData = await this.photoPrisma.delete({
                where: {
                    taggedPhoto: { id, isDeleted: true }
                },
                select: { taggedPhoto: { select: this.selectFields } }
            })
            if (responseData) {

                return {
                    message: 'The photo was deleted successfuly!',
                    data: responseData ?? null,
                    statusCode: 200
                };
            }
            else throw new BadRequestException('Bad request while deleting the photo');
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
