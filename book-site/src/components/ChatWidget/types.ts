export interface Citation {
  index: number;
  chapter_title: string;
  section_heading: string;
  score: number;
  excerpt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  timestamp: number;
  isStreaming: boolean;
}

export interface ChatChunk {
  type: 'token' | 'citations' | 'error' | 'done';
  text?: string;
  citations?: Citation[];
  detail?: string;
}

export interface SearchResultItem {
  text: string;
  source_path: string;
  chapter_title: string;
  section_heading: string;
  module: string;
  score: number;
  chunk_index: number;
}

export interface SelectionState {
  text: string;
  rect: DOMRect | null;
  isVisible: boolean;
}
