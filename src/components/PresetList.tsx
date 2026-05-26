import { TranscriptPreset } from "../types";
import { FileText, Users, Clock, Tag } from "lucide-react";

interface PresetListProps {
  presets: TranscriptPreset[];
  selectedPresetId: string | null;
  onSelectPreset: (preset: TranscriptPreset) => void;
}

export default function PresetList({ presets, selectedPresetId, onSelectPreset }: PresetListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-indigo-500" />
          快速載入會議範例逐字稿
        </h3>
        <span className="text-xs text-slate-400">點擊即可自動填入編輯區</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {presets.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`p-4 rounded-xl text-left border transition-all duration-200 relative overflow-hidden group hover:shadow-sm ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                  {preset.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {preset.duration}
                </span>
              </div>
              <h4 className="font-medium text-sm text-slate-800 mb-2 line-clamp-1 group-hover:text-indigo-900">
                {preset.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1 shrink-0">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {preset.participants.length} 位參與
                </span>
                <span className="truncate text-slate-400">
                  ({preset.participants.slice(0, 2).join(", ")}
                  {preset.participants.length > 2 ? "..." : ""})
                </span>
              </div>
              
              {isSelected && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-500 rounded-bl-lg" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
