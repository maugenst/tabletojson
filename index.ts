export {Tabletojson} from './lib/Tabletojson';

export type TableToJsonOptions = {
  useFirstRowForHeadings?: boolean; // Use the first row as header [default=false]
  stripHtmlFromHeadings?: boolean; // Strip all HTML from headings [default=true]
  stripHtmlFromCells?: boolean; // Strip HTML from cells [default=true]
  stripHtml?: boolean | null; // Strip off HTML [default=null] if set true stripHtmlFromHeadings and stripHtmlFromCells will also be true
  forceIndexAsNumber?: boolean; // Force the index to be used as number [default=false]
  countDuplicateHeadings?: boolean; // If given a _<NUMBER> will be added to the duplicate key [default=false]
  ignoreColumns?: number[] | null; // {Array} Array of column indices to ignored [default=null]
  onlyColumns?: number[] | null; // {Array} Array of column indices to be used. Overrides ignoreColumn [default=null]
  ignoreHiddenRows?: boolean; // Ignoring hidden rows [default=true]
  id?: string[] | null; // string of an id [default=null]
  headings?: string[] | null; // {Array} Array of Strings to be used as headings [default=null]
  containsClasses?: string[] | null; // {Array} Array of classes to find a specific table [default=null]
  limitrows?: number | null; // {Integer} Integer that limits the result of all rows to a given amount of data [default=null]
  got?: any;
};

export type CallbackFunction = (conversionResult: any) => any;
