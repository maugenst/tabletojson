export type HeaderRows = {
    from?: number;
    to: number;
    concatWith: string;
};
export type TableToJsonOptions = {
    useFirstRowForHeadings?: boolean;
    headers?: HeaderRows;
    stripHtmlFromHeadings?: boolean;
    stripHtmlFromCells?: boolean;
    stripHtml?: boolean | null;
    forceIndexAsNumber?: boolean;
    countDuplicateHeadings?: boolean;
    ignoreColumns?: number[] | null;
    onlyColumns?: number[] | null;
    ignoreHiddenRows?: boolean;
    id?: string[] | null;
    headings?: string[] | null;
    containsClasses?: string[] | null;
    limitrows?: number | null;
    fetchOptions?: RequestInit;
};
export type CallbackFunction = (conversionResult: any) => any;
export declare class Tabletojson {
    static convert(html: string, options?: TableToJsonOptions): any[];
    static convertUrl(
        url: string,
        callbackFunctionOrOptions?: TableToJsonOptions | CallbackFunction,
        callbackFunction?: CallbackFunction,
    ): Promise<any>;
}
export {Tabletojson as tabletojson};
