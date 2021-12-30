/*
 * @Description: 
 * @Version: 1.0
 * @Autor: z.cejay@gmail.com
 * @Date: 2021-12-30 12:22:14
 * @LastEditors: cejay
 * @LastEditTime: 2021-12-30 12:22:15
 */

export class Utils {

    /**
     * 异步延迟 调用方法 await sleep(1000)
     * @param {any} time
     */
    static sleep(time = 0) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, time);
        })
    }
}