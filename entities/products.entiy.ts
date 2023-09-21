import { BuildOptions, Model, DataTypes, ModelAttributes, Sequelize } from "sequelize";
import { BaseModel } from "./base.model";
export interface ProductAttributes extends BaseModel {
    productName?: string;
    price?: BigInteger;
    tbUserId?: BigInteger;

}

export interface ProductModel extends Model<ProductAttributes>, ProductAttributes { }

//static Object
export type ProductStatic = typeof Model & { new(values?: object, options?: BuildOptions): ProductModel }

//Entity
export const ProductFactory = (name: string, sequelize: Sequelize): ProductStatic => {


    const attributes: ModelAttributes<ProductModel, ProductStatic> = {
        id: {
            type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true, autoIncrementIdentity: true, allowNull: false
        },
        productName: {
            type: DataTypes.STRING, allowNull: false, unique: true, validate: { len: { args: [3, 20], msg: 'Must be 3-20 degits' } }
        },
        price: {
            type: DataTypes.INTEGER
        },
        tbUserId: {
            type: DataTypes.INTEGER, allowNull: false
        }

    } as ModelAttributes<ProductModel>;



    let x = sequelize.define(name, attributes, { tableName: name, freezeTableName: true }) as ProductStatic;



    return x;
}