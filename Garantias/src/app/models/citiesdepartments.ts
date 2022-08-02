export interface Departments {
  Id: number;
  Code: string;
  Description: string;
  Cities: Cities[];
}

export interface Cities {
  Code: string;
  Description: string;
}
