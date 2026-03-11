import { BadRequestException, ConflictException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IPrismaService } from '../../core/configs/interfaces/prisma-ripository/prisma.service';
import { PhotoService } from './photo/photo.service';
import { CreateGalleryDto, UpdateGalleryDto } from './DTOs/gallery.dto';
import { IResponse } from '../../shared/interfaces/responses.interfaces';
import { Photos } from './photo/photos.type';
import { assertSingle } from '../../utils/interfaces/assert-single.utils';
import { DEFAULT_ERROR_MSG, PHOTO_ERROR_MESSAGE } from '../../auth/interfaces/error-messages';
import { Galleries } from './gallery.type';
import { RemoveFile } from '../../utils/files.util';

@Injectable()
export class GalleryService {
    private readonly galleryPrisma: any;
    private readonly photoPrisma: any;
    private readonly tagPrisma: any;
    private readonly selectFields: any = {
        id: true,
        photo: {
            select: {
                id: true,
                name: true,
                path: true,
                title: true,
                description: true,
                isDeleted: true
            }
        },
        user: {
            select: {
                email: true,
                userName: true,
                avatar: true,
                isDeleted: true
            }
        },
        tag: {
            select: {
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
        this.tagPrisma = _dbService.prisma.tags;
    }

    async getAllPhoto(page: number, limit: number) {
        const skip = page ? (page - 1) * limit : 0;
        const photoFiltered = await this.galleryPrisma.findMany({
            take: limit,
            skip,
            select: this.selectFields,
            orderBy: {
                createdAt: "desc"
            }
        });
        const groupedMap = new Map<string, any>();

        for (const element of photoFiltered) {
            const photoId = element.photo.id;

            if (!groupedMap.has(photoId)) {
                groupedMap.set(photoId, {
                    photo: element.photo,
                    user: element.user,
                    tag: [],
                    createdAt: element.createdAt,
                    updatedAt: element.updatedAt,
                });
            }

            const group = groupedMap.get(photoId);

            // push tag uniquement
            if (
                element.tag &&
                !group.tag.some((t: any) => t.name === element.tag.name)
            ) {
                group.tag.push(element.tag);
            }
        }

        // Map → Array
        const groupedBy = Array.from(groupedMap.values());

        const shuffled = groupedBy.sort(() => Math.random() - 0.5);
        return {
            message: 'List of photos!',
            data: shuffled ?? [],
            statusCode: 200
        };
    }

    async getFilteredPhoto(query: any, page: number, limit: number) {
        const skip = page ? (page - 1) * limit : 0;
        const { name, title, tagNames, userName, userId, isAuthentified, tagMode } = query;

        // Construire les conditions uniquement si elles existent
        const textConditions: any[] = [];

        if (name) {
            textConditions.push({
                photo: {
                    name: {
                        contains: name,
                        mode: "insensitive",
                    }
                }
            });
        }

        if (title) {
            textConditions.push({
                photo: {
                    title: {
                        contains: title,
                        mode: "insensitive",
                    }
                }
            });
        }

        // if (userId) {
        //     conditions.push({ user_id: userId });
        // }

        if (userName) {
            textConditions.push({
                user: {
                    userName: {
                        contains: userName,
                        mode: "insensitive",
                    }
                }
            });
        }

        const isAuthUser = !!(userId && isAuthentified);
        // If authenticated, scope results to the user's tagged photos
        const shouldScopeToUser = isAuthUser;
        let tagPhotoIds: string[] | null = null;
        if (tagNames && tagNames.length > 0) {
            const uniqueTagNames = Array.from(
                new Set(
                    tagNames
                        .map((t: string) => (t || '').trim())
                        .filter((t: string) => t.length > 0)
                )
            );

            if (uniqueTagNames.length > 0) {
                const effectiveTagMode: 'search' | 'exact' =
                    tagMode === 'search' || tagMode === 'exact' ? tagMode : 'exact';

                if (effectiveTagMode === 'search') {

                    textConditions.push({
                        OR: uniqueTagNames.map((tag: string) => ({
                            tag: {
                                name: {
                                    contains: tag,
                                    mode: "insensitive",
                                },
                            },
                        })),
                    });
                } else {
                    const tagsFound = await this.tagPrisma.findMany({
                        where: {
                            name: {
                                in: uniqueTagNames,
                                mode: "insensitive",
                            },
                        },
                        select: { id: true }
                    });

                    const tagIds = tagsFound.map((t: any) => t.id);
                    if (tagIds.length !== uniqueTagNames.length) {
                        return {
                            message: 'List of filtered photos!',
                            data: [],
                            statusCode: 200
                        };
                    }

                    const tagWhere: any = {
                        tag_id: {
                            in: tagIds,
                        },
                    };

                    if (shouldScopeToUser) {
                        tagWhere.user_id = userId;
                    }

                    const taggedGroups = await this.galleryPrisma.groupBy({
                        by: ['photo_id'],
                        where: tagWhere,
                        _count: { photo_id: true },
                        having: { photo_id: { _count: { gte: tagIds.length } } },
                    });

                    tagPhotoIds = taggedGroups.map((g: any) => g.photo_id);
                    if (tagPhotoIds?.length === 0) {
                        return {
                            message: 'List of filtered photos!',
                            data: [],
                            statusCode: 200
                        };
                    }
                }
            }
        }

        let whereCondition: any = {};
        const andConditions: any[] = [];

        if (tagPhotoIds && tagPhotoIds.length > 0) {
            andConditions.push({ photo_id: { in: tagPhotoIds } });
        }

        if (textConditions.length > 0) {
            andConditions.push({ OR: textConditions });
        }

        if (shouldScopeToUser) {
            andConditions.push({ user_id: userId });
        }

        if (andConditions.length > 0) {
            whereCondition = { AND: andConditions };
        } else {
            whereCondition = {};
        }

        const photoFiltered = await this.galleryPrisma.findMany({
            take: limit,
            skip,
            where: whereCondition,
            select: this.selectFields,
            orderBy: {
                createdAt: "desc"
            }
        });


        // grouping result
        const groupedMap = new Map<string, any>();
        let groupName: string = '';


        for (const element of photoFiltered) {
            const photoId = element.photo.id;
            if (userId && isAuthentified) {
                const userId = element.user.id;
                groupName = `${photoId}_${userId}`;
            } else {
                groupName = photoId;
            }

            if (!groupedMap.has(groupName)) {
                groupedMap.set(groupName, {
                    photo: element.photo,
                    user: element.user,
                    tag: [],
                    createdAt: element.createdAt,
                    updatedAt: element.updatedAt,
                });
            }

            const group = groupedMap.get(groupName);

            // push tag uniquement
            if (
                element.tag &&
                !group.tag.some((t: any) => t.name === element.tag.name)
            ) {
                group.tag.push(element.tag);
            }
        }

        // Map → Array
        const groupedBy = Array.from(groupedMap.values());

        const shuffled = groupedBy.sort(() => Math.random() - 0.5);

        return {
            message: 'List of filtered photos!',
            data: shuffled ?? [],
            statusCode: 200
        };
    }

    async createPhoto(data: CreateGalleryDto): Promise<IResponse<any[]>> {
        let response: IResponse<any[]>;
        try {
            const { name, path, title, description, tags_id, user_id } = data;
            let responseData: any[] = [];
            // create photo
            const photoCreated = await this._photoService.createPhoto({ name, path, title, description });
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
                const tags: string[] = typeof tags_id == "string" ? [tags_id] : tags_id;
                // link together
                const photoTagged = await Promise.all(
                    tags.map(tag_id =>
                        this.galleryPrisma.create({
                            data: {
                                photo_id: photo.id,
                                tag_id,
                                user_id,
                            },
                        }),
                    ),
                );

                responseData.push(...photoTagged);
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

    async updatePhoto(data: UpdateGalleryDto, hasFile: boolean = false): Promise<IResponse<any[]>> {
        let response: IResponse<any[]>;
        try {
            const { name, path, title, description, photo_id, tags_id, user_id } = data;
            let responseData: any[] = [];
            const existingPhoto = await this.photoPrisma.findUnique({
                where: { id: photo_id },
                select: { path: true },
            });

            if (!existingPhoto) {
                throw new NotFoundException(PHOTO_ERROR_MESSAGE.notfound);
            }

            // 2️⃣ supprimer l’ancienne image SI changement
            if (hasFile && existingPhoto.path && existingPhoto.path !== path) {
                RemoveFile(existingPhoto.path);
            }
            // update photo
            const photoUpdated = await this._photoService.updatePhoto(photo_id!, { name, path, title, description });
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
                const tags: string[] = typeof tags_id == "string" ? [tags_id] : tags_id!;
                // link together

                // delete existing phototagged for the photo
                await this.galleryPrisma.deleteMany({
                    where: {
                        photo_id: photo.id,
                        user_id
                    }
                })
                // link together  
                const photoTagged = await Promise.all(
                    tags.map(tag_id =>
                        this.galleryPrisma.create({
                            data: {
                                photo_id: photo.id,
                                tag_id,
                                user_id,
                            },
                        }),
                    ),
                );

                responseData.push(...photoTagged);
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

    async deletePhoto(id: string) {
        let response: IResponse<Galleries | null>;
        try {
            const photo = await this.photoPrisma.findUnique({
                where: { id },
                select: { path: true },
            });

            if (!photo) {
                throw new NotFoundException("Photo not found");
            }


            const responseData = await this.galleryPrisma.deleteMany({
                where: {
                    photo_id: id
                }
            })
            if (responseData) {
                const deleted = await this._photoService.deletePhoto(id, photo.path);
                if (!deleted.statusCode || deleted.statusCode != HttpStatus.OK) {
                    throw new InternalServerErrorException(deleted.message || "There was an error while deleting the photo")
                }

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

    async findById(id: string) {
        let response: IResponse<Galleries | null>;
        try {
            const responseData = await this.galleryPrisma.findFirst({
                where: {
                    photo_id: id
                },
                select: {
                    photo: {
                        select: {
                            path: true,

                        }
                    }
                }
            })
            if (responseData) {
                return {
                    message: 'The photo was found successfuly!',
                    data: responseData ?? null,
                    statusCode: 200
                };
            }
            else throw new BadRequestException('Bad request while finding the photo');
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


