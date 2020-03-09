import { CallbackFunction, TableToJsonOptions } from '../index';
export declare class Tabletojson {
    static convert(html: string, options?: TableToJsonOptions): any[];
    static convertUrl(url: string, callbackFunctionOrOptions?: TableToJsonOptions | CallbackFunction, callbackFunction?: CallbackFunction): Promise<any>;
}
