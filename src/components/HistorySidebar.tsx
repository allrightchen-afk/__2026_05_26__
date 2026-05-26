import { HistoryItem } from "../types";
import { History, Calendar, Trash2, ArrowRight } from "lucide-react";

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function HistorySidebar({ history, onSelect, onDelete, onClearAll }: HistorySidebarProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
        <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h3 className="font-semibold text-xs text-slate-600">尚無歷史紀錄</h3>
        <p className="text-[11px] text-slate-400 mt-1">您成功生成的會議對帳總結會保存在此處。</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col h-full max-h-[500px]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
          <History className="w-4 h-4 text-slate-500" />
          本機歷史紀錄 ({history.length})
        </h3>
        <button
          onClick={onClearAll}
          className="text-[11px] font-medium text-rose-500 hover:text-rose-600 transition-colors"
        >
          全部清除
        </button>
      </div>

      <div className="overflow-y-auto space-y-2 flex-1 pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            className="group relative flex items-start justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-100 text-left transition-all duration-200 cursor-pointer"
            onClick={() => onSelect(item)}
          >
            <div className="space-y-1.5 max-w-[85%]">
              <h4 className="font-semibold text-xs text-slate-700 truncate group-hover:text-indigo-900">
                {item.title}
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-0.5">
                  <Calendar className="w-3 h-3" />
                  {item.timestamp}
                </span>
                <span className="px-1.5 bg-indigo-100/60 text-indigo-700 rounded-sm">
                  {item.targetLanguage}
                </span>
              </div>
            </div>

            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
