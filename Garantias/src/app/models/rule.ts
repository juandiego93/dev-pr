export class RuleRequest {
  ruleName: string;
  idFlow: number;
}

export interface RuleResponse {
  isValid: boolean;
  message: string;
  rulesWarranty: RuleResponseMessage[];
}

export interface RuleResponseMessage {
  ruleId: number,
  ruleName: string,
  ruleDescription: number,
  ruleValues: [{
    value: string,
    functionality: number,
    action: string,
    actionDescription: string
  }]
}


