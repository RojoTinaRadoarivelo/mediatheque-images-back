
// MODEL
export class Tags {
    id: string;
    name: string;
    createdAt: Date;

}

// OUTPUTS
export const TagsOutputDto = {
    id: true,
    name: true,
    isDeleted: true,
    createdAt: true,
    updatedAt: true
}

export const CreatedTagOutputDto = {
    name: true,
    createdAt: true
}

export const UpdatedTagOutputDto = {
    name: true,
    createdAt: true,
    updatedAt: true
}
export const DeletedTagOutputDto = {
    name: true,
    createdAt: true
};
export const SearchTagsOutputDto = {
    name: true,
    createdAt: true,
    updatedAt: true
};
export const FilterTagsOutputDto = {
    id: true,
    name: true,
    createdAt: true,
    updatedAt: true
};