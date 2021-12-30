/*
 * @Description: 
 * @Version: 1.0
 * @Autor: z.cejay@gmail.com
 * @Date: 2021-12-30 11:18:08
 * @LastEditors: cejay
 * @LastEditTime: 2021-12-30 12:06:54
 */


/**
 * 使用前需要使用createPool进行初始化操作
 */
import { Pool, createPool, MysqlError, PoolConnection } from 'mysql';


export class MysqlHelper {
    private pool?: Pool;
    constructor() {
        this.pool = createPool({
            host: '192.168.100.216',
            port: 3306,
            user: 'blockchain',
            password: 'cCAQ4hHn3tvZH3xnk6PY',
            database: 'blockchaindata',
            charset: 'utf8mb4',
            multipleStatements: true
        });
    }

    queryparams(sql: string, params: any = null): Promise<any> {
        return new Promise((resolve, reject) => {
            this.pool?.getConnection((err: MysqlError, connection: PoolConnection) => {
                if (err) {
                    reject(err);
                } else {
                    connection.query(sql, params, (qerr, vals, fields) => {
                        //释放连接    
                        connection.release();
                        if (qerr) {
                            reject(qerr);
                        } else {
                            resolve(vals);
                        }
                    });
                }

            });
        });

    }


}



