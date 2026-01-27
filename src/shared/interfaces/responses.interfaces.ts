import { HttpStatus } from "@nestjs/common";

export interface IResponse<T> {
    message: string;
    data?: T | T[] | null;
    status: HttpStatus
}