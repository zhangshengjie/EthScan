/*
 * @Description: 
 * @Version: 1.0
 * @Autor: z.cejay@gmail.com
 * @Date: 2021-08-07 22:36:38
 * @LastEditors: cejay
 * @LastEditTime: 2021-12-30 13:50:26
 */


import { OpenSea } from './openSea';
import { MysqlHelper } from './utils/mysqlHelper';
import { WatchERCs } from './watchERCs';



async function main() {
    const watchERC =  new WatchERCs();
    watchERC.Run();
    new OpenSea().Run();
    console.log('运行');
}

main();

