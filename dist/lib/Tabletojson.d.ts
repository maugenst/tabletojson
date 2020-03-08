import { CallbackFunction, TableToJsonOptions } from '../index';
export declare class Tabletojson {
    static convert(html: string, options?: TableToJsonOptions): any[];
    static convertUrl(url: string, callbackFunctionOrOptions?: CallbackFunction): Promise<any>;
    static convertUrl(url: string, callbackFunctionOrOptions?: TableToJsonOptions): Promise<any>;
    static convertUrl(url: string, callbackFunctionOrOptions: TableToJsonOptions, callbackFunction: CallbackFunction): Promise<any>;
}
