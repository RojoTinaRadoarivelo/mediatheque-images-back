// MODEL
export class Photos {
    id: string;
    name: string;
    path: string;
    createdAt: Date;

}

// OUTPUTS
export const PhotosOutputDto = {
    id: true,
    name: true,
    path: true,
    isDeleted: true,
    createdAt: true,
    updatedAt: true
}