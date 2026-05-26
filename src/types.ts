export interface TranscriptPreset {
  id: string;
  title: string;
  category: string;
  content: string;
  duration: string;
  participants: string[];
}

export interface SystemInstructionPreset {
  id: string;
  name: string;
  description: string;
  instruction: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  timestamp: string;
  inputLength: number;
  output: string;
  targetLanguage: string;
}
