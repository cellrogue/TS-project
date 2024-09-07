import { Timestamp } from "firebase/firestore";
import { User } from "./user";

type ThreadCategory =
    | 'Software Development'
    | 'Networking & Security'
    | 'Hardware & Gadgets'
    | 'Cloud Computing'
    | 'Tech News & Trends';

type ThreadStatus = 'New' | 'Hot';

type Tag = {
    id: string;
    name: string;
}

export type Comment = {
  id: string;
  content: string;
  creationDate: Timestamp;
  creator: User;
  parentId?: string;
}

export type Thread = {
  id: string;
  title: string;
  category: ThreadCategory;
  status?: ThreadStatus;
  creationDate: Timestamp;
  description: string;
  creator: User;
  comments: Comment[];
  isQnA?:boolean;
  isAnswered?:boolean;
  answeredCommentId?: string | null;
  isLocked: boolean;
  tags: Tag[];
}