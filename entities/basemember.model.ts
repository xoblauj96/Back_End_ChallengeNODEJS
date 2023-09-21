import { BaseModel } from "./base.model";

export class BaseMemberModel extends BaseModel{
    userName?: string;
    password?: string;
    phoneNumber?: string;

    validPassword: (password: string) => boolean;
    hashPassword: (password: string) => boolean;
}