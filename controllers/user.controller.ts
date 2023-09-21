import { NextFunction, Request, Response } from "express";
import { APIService } from "../services/api.service";
import { UserModel } from "../entities/user.entity";
import { dbconnection, userEntity } from "../entities";
export interface ILogin {
    userName: string;
    password: string;
}
export class UserController {
    constructor() { }

    static checkAdminAuthorizeToken(req: Request, res: Response, next: NextFunction) {
        const token = req.headers['super-admin-authorization'] + '';
        if (APIService.validateSuperAdmin(token)) return next();
        res.status(402).send('You have no an authorization...!');
    }

    static checkAuthorize(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.headers['authorization'] + '';

            const newToken = APIService.validateToken(token);
            req.headers['authorization'] = newToken;
            res.setHeader('authorization', newToken);

            if (newToken) {
                req['_user'] = APIService.getCurrentUser(newToken);
                next();
            } else {
                res.status(402).send('You have no an authorization! hhh')
            }
            
        } catch (error) {
            console.log(error);
            res.send(APIService.errRes(error))
        }
    }


    static login(req: Request, res: Response) {
        const login = req.body as ILogin;
        console.log(login);
        if (login.userName && login.password) {
            userEntity.findOne({ where: { userName: login.userName } }).then(r => {
                if (r) {
                    if (r.validPassword(login.password)) {
                        const user = APIService.clone(r);
                        delete user.password;
                        delete user.id;
                        delete user.phoneNumber;
                        console.log(user);
                        const token = APIService.createToken(r);
                        if (!token) {
                            return res.send(APIService.errRes("Fail setting a token"))
                        }
                        res.setHeader('authorization', token);
                        res.send(APIService.okRes({ user, token }, "Login Ok"))
                    } else {
                        res.send(APIService.errRes("Incorrect password"))
                    }
                } else {
                    res.send(APIService.errRes("User not found..."))
                }
            }).catch(er => {
                console.log(er);
                res.send(APIService.errRes(er, "Error login"))

            })
        } else {
            res.send(APIService.errRes('Empty username or password'));
        }

    }

    static async createUser(req: Request, res: Response) {
        try {
            const user = req.body as UserModel;
            delete user.id;
            dbconnection.transaction().then(transaction => {
                userEntity.findOne({ where: { userName: user.userName, phoneNumber: user.phoneNumber }, transaction }).then(async r => {
                    if (r) {
                        await transaction.rollback();
                        res.send(APIService.errRes('User exist'));
                    } else {
                        userEntity.create(user).then(r => {
                            res.send(APIService.okRes(r, 'create Ok'));
                        }).catch(e => {
                            res.send(APIService.errRes(e))
                        })
                    }
                })
            })

        } catch (error) {
            console.log(error)
        }
    }


    static getUserList(req: Request, res: Response) {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 5;
            const skip = req.query.skip ? Number(req.query.skip) : 0;
            userEntity.count().then(row => {
                userEntity.findAll({ limit, offset: limit * skip, order: [["id", "desc"]] }).then(r => {
                    const users = r.map((v) => {
                        const u = APIService.clone(v);
                        delete u.role;
                        delete u.password;
                        return u as UserModel;
                    })
                    res.send(APIService.okRes(users, `All Data ${row} rows`));
                })

            }).catch(err => {
                console.error(err);
                res.send(APIService.errRes(err))
            })
        } catch (error) {
            console.error(error);

        }
    }

    static getUserDetail(req: Request, res: Response) {
        try {
            const id = req.params.id;
            userEntity.findByPk(id).then(r => {
                if (r) {
                    const user = APIService.clone(r);
                    delete user.password;
                    delete user.role;
                    res.send(APIService.okRes(user))
                } else {
                    res.send(APIService.errRes([], "no data"))
                }
            })
        } catch (error) {
            console.log(error);
            res.send(APIService.errRes(error))

        }
    }


    static deleteUser(req: Request, res: Response) {
        try {
            let id = req.query.id + "";
            userEntity.findByPk(id).then(r => {
                if (r) {
                    let x = r?.destroy();
                    res.send(APIService.okRes(x));
                } else {
                    res.send(APIService.errRes([], "Not found data for delete."))
                }
            })
        } catch (error) {
            console.log(error);

        }
    }

    static checkIsYourSelf(req: Request, res: Response, next: NextFunction){
        if(APIService.checkMySelf(req.headers['authorization']+'',req)){
            next();
        }else{
            res.send(APIService.errRes('You have no an authorization! to check yourself.'));
        }
    }
}