//#region lib/Tabletojson.d.ts
type HeaderRows = {
  from?: number;
  to: number;
  concatWith: string;
};
type TableToJsonOptions = {
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
type CallbackFunction = (conversionResult: any) => any;
declare class Tabletojson {
  static convert(html: string, options?: TableToJsonOptions): any[];
  static convertUrl(url: string, callbackFunctionOrOptions?: TableToJsonOptions | CallbackFunction, callbackFunction?: CallbackFunction): Promise<any>;
}
//#endregion
export { CallbackFunction, HeaderRows, TableToJsonOptions, Tabletojson, Tabletojson as tabletojson };