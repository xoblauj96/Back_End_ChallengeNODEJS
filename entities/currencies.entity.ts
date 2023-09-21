import { BuildOptions, Model, DataTypes, ModelAttributes, Sequelize } from "sequelize";
import { BaseMemberModel } from "./basemember.model";
import bcryptjs from 'bcryptjs'
import { BaseModel } from "./base.model";
export interface CurrenciesAttributes extends BaseModel {
    currencies?: string;
    exchangeRate: BigInteger
}

export interface CurrenciesModel extends Model<CurrenciesAttributes>, CurrenciesAttributes { }


//static Object

export type CurrenciesStatic = typeof Model & { new(values?: object, options?: BuildOptions): CurrenciesModel }

//Entity
export const CurrenciesFactory = (name: string, sequelize: Sequelize): CurrenciesStatic => {


    const attributes: ModelAttributes<CurrenciesModel, CurrenciesStatic> = {
        id: {
            type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true, autoIncrementIdentity: true, allowNull: false
        },
        currencies: {
            type: DataTypes.STRING, allowNull: false, unique: true, validate: { len: { args: [3, 20], msg: 'Must be 3-20 degits' } }
        },
        exchangeRate: {
            type: DataTypes.INTEGER
        }

    } as ModelAttributes<CurrenciesModel>;
    let x = sequelize.define(name, attributes, { tableName: name, freezeTableName: true }) as CurrenciesStatic;
    return x;
}