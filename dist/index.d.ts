export { Tabletojson } from './lib/Tabletojson';
export declare type TableToJsonOptions = {
    useFirstRowForHeadings?: boolean;
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
    got?: any;
};
export declare type CallbackFunction = (conversionResult: any) => any;
