import { Sequelize } from "sequelize";
import { UserFactory } from "./user.entity";
import { ProductFactory } from "./products.entiy";
import { Products_CurrenciesFactory } from "./products_currecies.entity";
import { CurrenciesFactory } from "./currencies.entity";



export const dbconnection = new Sequelize('backend', 'postgres', 'syspass', {
    host: 'localhost',
    port:5432,
    dialect: 'postgres' 
  });


export enum EntityPrifix {
    Users='tbUser',
    Products='tbProduct',
    Products_Currencies='tbProducts_Currencies',
    Currencies='tbCurrencies'
}

export const userEntity = UserFactory(EntityPrifix.Users,dbconnection);
export const productsEntity =ProductFactory(EntityPrifix.Products,dbconnection);
export const products_CurrenciesEntity = Products_CurrenciesFactory(EntityPrifix.Products_Currencies,dbconnection);
export const currenciesEntity = CurrenciesFactory(EntityPrifix.Currencies,dbconnection);

// userEntity.sync({force:true});
// productsEntity.sync({force:true});
// products_CurrenciesEntity.sync({force:true});
// currenciesEntity.sync({force:true});