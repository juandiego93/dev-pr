export class RequestKnowledgeBase {
  strNameFunctionality: string;
  strNameProcess: string;
  strNameKnowledge: string;
}

export class DataKnowledgeBase{
  nameKnowledge: string;
  message: string;
  negative: string;
  affirmative: string;
  strNameFunctionality: string;
  strNameProcess: string;
  data: [
    {
      key: string,
      value: string
    }
  ];
}

export interface ResponseKnowledgeBase {
  ID_KNOWLEDGE_BASE: string;
  NAME_KNOWLEDGE: string;
  VALUE_KNOWLEDGE: string;
  PROCESS_BY_FUNCTIONALITY_ID: string;
}
