// MODEL
export class Photos {
    id: string;
    name: string;
    path: string;
    title: string;
    description: string;
    createdAt: Date;

}

// OUTPUTS
export const PhotosOutputDto = {
    id: true,
    name: true,
    path: true,
    title: true,
    description: true,
    isDeleted: true,
    createdAt: true,
    updatedAt: true
}