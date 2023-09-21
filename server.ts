import express from 'express'
import { Request, Response, Application } from "express";
import cors from 'cors';
import bodyParser from "body-parser";
import { Sequelize } from "sequelize";
const { Op, Model, DataTypes } = require("sequelize");

let app: Application = express();
app.use(cors());
app.use(bodyParser.json());

let allowedUpdate = ['phonenumber', 'password']

class myUser {
  username?: string;
  password?: string;
  phonenumber?: string;
}



// const dbconnection = new Sequelize('test2', 'root', '', {
//   host: 'localhost',
//   dialect: 'mysql' /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
// });

const dbconnection = new Sequelize('backend', 'postgres', 'syspass', {
  host: 'localhost',
  port:5432,
  dialect: 'postgres' /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
});

let userEntity = dbconnection.define('myUser', {
  id: { type: DataTypes.INTEGER, unique: true, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  phonenumber: { type: DataTypes.STRING }
});

dbconnection.authenticate().then(r => {
  console.log(r);
  userEntity.sync({ force: true });

  app.get('/', (req: Request, res: Response) => {
    userEntity.findAll().then(r => {
      res.send({ data: r, message: 'success', status: 1 })
    }).catch((e) => {
      res.send({ data: e, message: 'error', status: 0 })

    })
  });


  app.post('/byone/:id', (req: Request, res: Response) => {
    let id = req.params.id + "";
    userEntity.findByPk(id).then(r => {
      if (!r) res.send({ data: {}, message: 'success', status: 1 })
      else
        res.send({ data: r, message: 'success', status: 1 })
    }).catch((e) => {
      res.send({ data: e, message: 'error', status: 0 })

    })
  })


    .put('/create', (req: Request, res: Response) => {
      let user = req.body;
      userEntity.create(user).then(r => {
        res.send({ data: r, message: "success", status: 1 })
      }).catch((e) => {
        res.send({ data: e["parent"]?.sqlMessage, message: 'error', status: 0 })

      })
    })

    .patch('/update/:id', (req: Request, res: Response) => {
      let id = req.params.id + "";
      let user = req.body as unknown as myUser;
      console.log(user);
      console.log(id);


      userEntity.findByPk(id).then(async r => {
        // r= r as any;
        if (r) {
          for (const key in user) {
            console.log(key);

            console.log(Object.prototype.hasOwnProperty.call(user, key))
            if (Object.prototype.hasOwnProperty.call(user, key)) {
              if (!allowedUpdate.includes(key)) continue;
              r[key] = user[key];

            }
          }
          let x = await r.save();
          res.send({ data: x, message: "success", status: 1 })
        } else {
          res.send({ data: [], message: "not found data", status: 1 })
        }



      }).catch((e) => {
        res.send({ data: e["parent"]?.sqlMessage, message: 'error', status: 0 })

      })
    })

    .delete('/delete', (req: Request, res: Response) => {
      let id = req.query.id + "";
      userEntity.findByPk(id).then(r => {
        if (r) {
          let x = r.destroy();
          res.send({ data: x, message: `delete ${r['username']} success`, status: 1 })
        } else {
          res.send({ data: [], message: 'data not found', status: 1 });
        }
      }).catch(e => {
        res.send({ data: e, message: 'delete error', status: 0 })
      })
    })

}).catch(e => {
  console.log("==============>", e);

})



app.listen(8888, '0.0.0.0', () => {
  console.log('server start 0.0.0.0 port 8888');

});