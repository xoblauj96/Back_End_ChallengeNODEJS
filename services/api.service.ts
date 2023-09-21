import { UserModel } from "../entities/user.entity";
import jwt from 'jsonwebtoken';
import { Request } from 'express';

export class APIService {
    static okRes(data: any, message: string = 'OK', status: number = 1) {
        return { data, message, status }
    }

    static errRes(data: any, message: string = 'Error', status: number = 0) {
        return { data, message, status }
    }

    static validateSuperAdmin(k: string): boolean {
        if (k === Keys.superadminkey) return true;
        else return false;
    }

    static clone(data: any) {
        return JSON.parse(JSON.stringify(data));
    }


    static createToken(data: UserModel) {
        try {

            return jwt.sign({ data }, Keys.jwtKey, { expiresIn: '10000m' })
        } catch (error) {
            console.log(error);
            return '';
        }
    }


    static validateToken(k: string) {
        try {
            const data = jwt.verify(k, Keys.jwtKey)['data'] as UserModel;
            const token = APIService.createToken(data);
            if (token) return token;
            else return '';
        } catch (error) {
            console.log(error);
            return '';
        }
    }

    static getCurrentUser(k: string) {
        try {

            const o = jwt.decode(k)

            if (o) {
                return o['data'];
            }
        } catch (error) {
            console.log(error);

        }
        return null;
    }



    static checkMySelf(k: string, req: Request) {
        try {
            const obj = jwt.decode(k);
            if (obj) {
                const data = obj['data'] as UserModel;
                const user = req['_user'] as UserModel;
                console.log(data);
                console.log(user);
                const id = req.params.id;
                // const id = req.body.id;
                // console.log('id: ' + id)
                if (user.id == data.id && user.id === Number(id))
                    return true;
                else
                    return false;
            }
        } catch (error) {

        }
    }

}

enum Keys {
    jwtKey = 'Dx4YsbptOGuHmL94qdC2YAPqsUFpzJkc',
    superadminkey = '9F58A83B7628211D6E739976A3E3A'
}