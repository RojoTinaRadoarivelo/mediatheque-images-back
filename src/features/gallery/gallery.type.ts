// MODEL
export class Galleries {
    id: string;
    photo: {
        name: string;
        path: string;
    }
    tag: {
        name: string;
    }
    user: {
        userName: string;
        email: string;
    }
    createdAt: Date;

}

// OUTPUTS
export const GalleriesOutputDto = {
    id: true,
    photo: {
        name: true,
        path: true
    },
    tag: {
        name: true
    },
    user: {
        userName: true,
        email: true
    },
    isDeleted: true,
    createdAt: true,
    updatedAt: true
}