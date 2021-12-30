/*
 * @Description: 
 * @Version: 1.0
 * @Autor: z.cejay@gmail.com
 * @Date: 2021-12-30 13:42:16
 * @LastEditors: cejay
 * @LastEditTime: 2021-12-30 22:10:07
 */
import { Web3Helper } from './utils/web3';

import { MysqlHelper } from './utils/mysqlHelper';
import { Utils } from './utils/utils';

export class OpenSea {
    web3 = Web3Helper.getWeb3();
    mysqlHelper = new MysqlHelper();
    constructor() {

    }
    public async Run() {
        const address = '0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b';
        const coin_abi = await Web3Helper.readABI('opensea');
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
            } else {
                await Utils.sleep(100);
            }

            let fromBlock = strkey_intval + 1
            if (toBlock - fromBlock > 100) {
                toBlock = fromBlock + 100
            }

            const entries = await coin_contract.getPastEvents('OrdersMatched', {
                fromBlock: fromBlock,
                toBlock: toBlock
            });
            let transfer_list: string[] = [];
            let promises: Promise<any>[] = [];
            //Promise.all()
            for (let i = 0; i < entries.length; i++) {
                const order = entries[i];
                promises.push(this.web3.eth.getTransactionFromBlock(order.blockNumber, order.transactionIndex));
            }
            const transactions = await Promise.all(promises);
            for (let i = 0; i < entries.length; i++) {
                const order = entries[i];
                const _tx = order.transactionHash;
                const _maker = order.returnValues.maker;
                const _taker = order.returnValues.taker;
                const _price = order.returnValues.price;
                const _detail = transactions[i];
                //let a1 = await this.web3.eth.getTransactionFromBlock(order.blockNumber, order.transactionIndex)
                const _from = _detail.from;
                const _to = _detail.to;
                const _value = _detail.value;
                transfer_list.push(`(${_detail.blockNumber}, '${_tx}', '${_from}', '${_to}',${_value},'${_maker}', '${_taker}',${_price})`);

            }

            if (transfer_list.length > 0) {

                this.mysqlHelper.queryparams(
                    "INSERT INTO opensea_ordersmatched (`blocknum`, `tx`, `from`, `to`, `value`, `maker`, `taker`, `price`) VALUES " + transfer_list.join(','))
                this.mysqlHelper.queryparams("update strkey_intval set intval=? where strkey=?", [
                    toBlock, address])
                console.log(`opensea_ordersmatched [${fromBlock}-${toBlock}], tx count:${transfer_list.length}`);

            }
            strkey_intval = toBlock;
        }
        console.log('opensea_ordersmatched 已停止');

    }
}