import { Fieldset } from 'primeng/primeng';

export interface SearchResult {
    // the statement that was executed to get the current result
    // Use for fetching the next page for example
    statement: string;
    hasMoreItems: boolean;
    items: SearchResultItem[];
    // object types within the result
    objectTypes: string[];
}

export interface SearchResultItem {
    objectTypeId: string
    content: SearchResultContent, 
    fields: Map<string, any>
}

export interface SearchResultContent {
    contentStreamId: string,
    fileName: string,
    size: number,
    mimeType: string
}