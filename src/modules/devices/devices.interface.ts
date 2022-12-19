export interface SensorsQueryType {
  sort?: sort;
  order?: order;
}

export type order = 'asc' | 'desc';
export type sort =
  | 'name'
  | 'id'
  | 'uniquename'
  | 'datemodified'
  | 'newrecord'
  | string
  | undefined
  | string[];

export interface SennsorSearch {
  sortby:
    | 'price'
    | 'interest'
    | 'brand'
    | 'name'
    | 'date'
    | 'sale'
    | 'sell'
    | 'view'
    | string
    | undefined
    | string[];
}
