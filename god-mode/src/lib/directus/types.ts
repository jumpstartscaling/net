export interface QueryCmp {
    _eq?: any;
    _neq?: any;
    _gt?: any;
    _lt?: any;
    _contains?: any;
    _in?: any[];
}

export interface QueryFilter {
    [field: string]: QueryCmp | QueryFilter | any;
    _or?: QueryFilter[];
    _and?: QueryFilter[];
}

export interface Query {
    filter?: QueryFilter;
    fields?: string[];
    limit?: number;
    offset?: number;
    sort?: string[];
    aggregate?: any;
}
