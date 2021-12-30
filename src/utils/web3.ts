/*
 * @Description: 
 * @Version: 1.0
 * @Autor: z.cejay@gmail.com
 * @Date: 2021-12-30 11:52:10
 * @LastEditors: cejay
 * @LastEditTime: 2021-12-30 12:51:21
 */

import Web3 from 'web3';
import fs from 'fs-extra';
import path from 'path';

class Web3Helper {

    private static web3: Web3;

    private static createWeb3(url = "http://192.168.100.216:8545") {
        if (!Web3Helper.web3) {
            Web3Helper.web3 = new Web3(url);
        }
    }

    static getWeb3(): Web3 {
        this.createWeb3();
        return Web3Helper.web3;
    }

    static async readABI(name: string) {
        const p = path.join(__dirname,`../ABI/${name}.json`)
        return fs.readJSONSync(p);
    }
    
}

export { Web3Helper };