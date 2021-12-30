/*
 * @Description: 
 * @Version: 1.0
 * @Autor: z.cejay@gmail.com
 * @Date: 2021-12-30 11:42:36
 * @LastEditors: cejay
 * @LastEditTime: 2021-12-30 13:42:44
 */


// import * as erc20 from './ABI/erc20.json';
// import * as erc721 from './ABI/erc721.json';

import { Web3Helper } from './utils/web3';

import { MysqlHelper } from './utils/mysqlHelper';
import { Utils } from './utils/utils';

export class WatchERCs {
    web3 = Web3Helper.getWeb3();
    mysqlHelper = new MysqlHelper();
    constructor() {

    }
    public async Run() {
        const coins = await this.mysqlHelper.queryparams("select contractType,address,coinname from erclist");
        for (const coin of coins) {
            const contractType: string = coin['contractType'] || '';
            switch (coin['contractType']) {
                case 'erc20':
                    this.watchErc20(coin['address'], coin['coinname']);
                    break;
                case 'erc721':
                    this.watchErc721(coin['address'], coin['coinname']);
                    break;
                default:
                    break;
            }
        }
    }

    private async watchErc20(address: string, coin_name: string) {
        const coin_abi = await Web3Helper.readABI('erc20');
        const coin_contract = new this.web3.eth.Contract(coin_abi, address);


        let strkey_intval = -1
        let strkey_intval_raw = await this.mysqlHelper.queryparams(
            `select intval from strkey_intval where strkey='${address}'`
        )
        if (strkey_intval_raw.length === 0) {
            this.mysqlHelper.queryparams("INSERT INTO strkey_intval (strkey, intval) VALUES (?,?)", [
                address, 0
            ])
            strkey_intval = 0
        }
        else {
            strkey_intval = strkey_intval_raw[0]['intval']
        }

        while (true) {
            let toBlock = await this.web3.eth.getBlockNumber() - 12
            if (toBlock <= strkey_intval) {
                await Utils.sleep(1000 * 30);
                continue;
            }

            let fromBlock = strkey_intval + 1
            if (toBlock - fromBlock > 5000) {
                toBlock = fromBlock + 5000
            }

            const entries = await coin_contract.getPastEvents('Transfer', {
                fromBlock: fromBlock,
                toBlock: toBlock
            });
            let transfer_list: string[] = [];
            for (const order of entries) {
                const _tx = order.transactionHash;
                const _from = order.returnValues.from;
                const _to = order.returnValues.to;
                const _value = order.returnValues.value;
                transfer_list.push(`(${order.blockNumber}, '${coin_name}', '${_tx}', '${_from}', '${_to}', ${_value})`);
            }
            if (transfer_list.length > 0) {
                this.mysqlHelper.queryparams(
                    "INSERT INTO erc20_transfer (`blocknum`, `name`, `tx`, `from`, `to`, `value`) VALUES " + transfer_list.join(','))
                this.mysqlHelper.queryparams("update strkey_intval set intval=? where strkey=?", [
                    toBlock, address])
                console.log(`${coin_name} [${fromBlock}-${toBlock}], tx count:${transfer_list.length}`);

            }
            strkey_intval = toBlock;
        }
    }

    private async watchErc721(address: string, coin_name: string) {
        const coin_abi = await Web3Helper.readABI('erc721');
        const coin_contract = new this.web3.eth.Contract(coin_abi, address);


        let strkey_intval = -1
        let strkey_intval_raw = await this.mysqlHelper.queryparams(
            `select intval from strkey_intval where strkey='${address}'`
        )
        if (strkey_intval_raw.length === 0) {
            this.mysqlHelper.queryparams("INSERT INTO strkey_intval (strkey, intval) VALUES (?,?)", [
                address, 0
            ])
            strkey_intval = 0
        }
        else {
            strkey_intval = strkey_intval_raw[0]['intval']
        }

        while (true) {
            let toBlock = await this.web3.eth.getBlockNumber() - 12
            if (toBlock <= strkey_intval) {
                await Utils.sleep(1000 * 30);
                continue;
            }

            let fromBlock = strkey_intval + 1
            if (toBlock - fromBlock > 5000) {
                toBlock = fromBlock + 5000
            }

            const entries = await coin_contract.getPastEvents('Transfer', {
                fromBlock: fromBlock,
                toBlock: toBlock
            });
            let transfer_list: string[] = [];
            for (const order of entries) {
                const _tx = order.transactionHash;
                const _from = order.returnValues.from;
                const _to = order.returnValues.to;
                const _tokenId = order.returnValues.tokenId;
                transfer_list.push(`(${order.blockNumber}, '${coin_name}', '${_tx}', '${_from}', '${_to}', 1, ${_tokenId})`);
            }
            if (transfer_list.length > 0) {
                this.mysqlHelper.queryparams(
                    "INSERT INTO erc721_transfer (`blocknum`, `name`, `tx`, `from`, `to`, `value`,tokenid) VALUES " + transfer_list.join(','))
                this.mysqlHelper.queryparams("update strkey_intval set intval=? where strkey=?", [
                    toBlock, address])
                console.log(`${coin_name} [${fromBlock}-${toBlock}], tx count:${transfer_list.length}`);

            }
            strkey_intval = toBlock;
        }
    }
}