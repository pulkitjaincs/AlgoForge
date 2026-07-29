export interface Question {
  _id?: string;
  id?: string;
  title: string;
  isSolved: boolean;
  difficulty?: string;
  order?: number;
  problemUrl?: string;
  platform?: string;
  resource?: string;
  companyTags?: string[];
  isStarred?: boolean;
  notes?: string;
  topicId?: string | null;
  subTopicId?: string | null;
}

export interface SubTopic {
  id: string;
  title: string;
  order?: number;
  topicId?: string;
  questions?: Question[];
}

export interface Topic {
  id: string;
  title: string;
  description?: string;
  order?: number;
  status?: string;
  subTopics?: SubTopic[];
  questions?: Question[];
}
