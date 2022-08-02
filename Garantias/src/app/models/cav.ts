export interface CavServiceResponse {
  response: Response;
  cavs:     Cav[];
}

export interface Cav {
  id:          number;
  codeCav:     number;
  nameCav:     string;
  addres:      string;
  cst:         string;
  model:       string;
  idcst:       number;
  city:        string;
  serviceTime: number;
  daysAttention: number;
}

export interface Response {
  isValid:     boolean;
  description: string;
}
