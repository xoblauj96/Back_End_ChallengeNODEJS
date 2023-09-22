import { NextFunction, Request, Response } from "express";
import { APIService } from "../services/api.service";
import { UserModel } from "../entities/user.entity";
import { dbconnection, productsEntity, products_CurrenciesEntity, userEntity } from "../entities";
import { ProductModel } from "../entities/products.entiy";
import { Op } from "sequelize";
let allowedUpdate = ['productName', 'price']

export class ProductController {
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


    static async createPrduct(req: Request, res: Response) {
        try {
            const product = req.body as ProductModel;
            product.productName = product.productName?.trim();
            delete product.id;
            dbconnection.transaction().then(transaction => {
                productsEntity.findOne({ where: { productName: { [Op.like]: product.productName?.trim() } }, transaction }).then(async r => {
                    if (r) {
                        await transaction.rollback();
                        res.send(APIService.errRes(`product '${product.productName}'  exist`));
                    } else {
                        productsEntity.create(product).then(async r => {
                            await transaction.commit();
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


    static getProductList(req: Request, res: Response) {
        try {
            userEntity.hasMany(productsEntity);
            productsEntity.belongsTo(userEntity);

            productsEntity.hasMany(products_CurrenciesEntity);
            products_CurrenciesEntity.belongsTo(productsEntity);

            const limit = req.query.limit ? Number(req.query.limit) : 5;
            const skip = req.query.skip ? Number(req.query.skip) : 0;
            productsEntity.count().then(row => {
                productsEntity.findAll({ limit, offset: limit * skip, order: [["id", "desc"]], include: [userEntity,products_CurrenciesEntity] }).then(r => {
                    res.send(APIService.okRes(r, `All Data ${row} rows`));
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


    static deleteProuct(req: Request, res: Response) {
        try {
            let product: ProductModel = req.body as ProductModel;
            let check: boolean = ProductController.checkProductIdUserId(product, res);
            if (check) return;

            productsEntity.findOne({ where: { tbUserId: product?.tbUserId, id: product?.id } }).then(rs => {
                if (rs) {
                    productsEntity.findByPk(product.id).then(r => {
                        if (r) {
                            let x = r?.destroy();
                            res.send(APIService.okRes(x));
                        } else {
                            res.send(APIService.errRes([], "Not found data for delete."))
                        }
                    })
                } else {
                    res.send(APIService.errRes([], "you do not have permision."))
                }
            }).catch((e) => {
                res.send(APIService.errRes(e, "Error Exception"))
            })


        } catch (error) {
            console.log("===========", error);
            res.send(APIService.errRes(error, "Error."))
        }

    }

    static updateProduct(req: Request, res: Response) {
        try {
            let product = req.body as ProductModel;
            productsEntity.findOne({ where: { tbUserId: product.tbUserId, id: product?.id } }).then(rr => {
                if (rr) {
                    productsEntity.findByPk(product.id).then(async r => {
                        if (r) {
                            for (const key in product) {

                                if (Object.prototype.hasOwnProperty.call(product, key)) {
                                    if (!allowedUpdate.includes(key)) continue;
                                    r[key] = product[key];
                                }
                            }
                            let x = await r.save();
                            res.send({ data: x, message: " update success", status: 1 })
                        } else {
                            res.send(APIService.errRes([], "do not found data."))
                        }
                    })
                } else {
                    res.send(APIService.errRes([], "you do not have permision."))
                }
            })

        } catch (error) {
            console.log(error);

        }
    }

    static checkProductIdUserId(product: ProductModel, res: Response): boolean {
        if (product?.tbUserId == undefined || product.tbUserId.toString() == '') {
            res.send(APIService.errRes([], "Please input user id")); return true;
        }
        if (product?.id == undefined || product?.id.toString() == '') {
            res.send(APIService.errRes([], "Please check product id")); return true;
        }
        return false;
    }

}

