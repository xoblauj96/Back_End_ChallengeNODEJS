import { BuildOptions, Model, DataTypes, ModelAttributes, Sequelize } from "sequelize";

export interface Products_CurrenciesAttributes {
    id?: string;
    tbProductId?: string;
    currenciesId?: string;

}

export interface Products_CurrenciesModel extends Model<Products_CurrenciesAttributes>, Products_CurrenciesAttributes { }

//static Object
export type Products_CurrenciesStatic = typeof Model & { new(values?: object, options?: BuildOptions): Products_CurrenciesModel }

//Entity
export const Products_CurrenciesFactory = (name: string, sequelize: Sequelize): Products_CurrenciesStatic => {


    const attributes: ModelAttributes<Products_CurrenciesModel, Products_CurrenciesStatic> = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
            autoIncrementIdentity: true,
            allowNull: false
        },
        tbProductId: {
            type: DataTypes.INTEGER
        },
        currenciesId: {
            type: DataTypes.INTEGER
        }
    } as ModelAttributes<Products_CurrenciesModel>;

    let x = sequelize.define(name, attributes, { tableName: name, freezeTableName: true }) as Products_CurrenciesStatic;

    return x;
}