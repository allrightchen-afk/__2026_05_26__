import { useState } from "react";
import { SystemInstructionPreset } from "../types";
import { Settings2, ChevronDown, ChevronUp, FileCode2, HelpCircle } from "lucide-react";

interface SystemInstructionEditorProps {
  presets: SystemInstructionPreset[];
  activePresetId: string;
  customInstruction: string;
  onSelectPreset: (id: string) => void;
  onChangeCustomInstruction: (value: string) => void;
}

export default function SystemInstructionEditor({
  presets,
  activePresetId,
  customInstruction,
  onSelectPreset,
  onChangeCustomInstruction,
}: SystemInstructionEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedPreset = presets.find((p) => p.id === activePresetId);

  return (
    <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden transition-all duration-300">
      {/* Header section toggleable */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Settings2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-800 flex items-center gap-2">
              AI 生成模板與系統指引 (System Instructions)
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 animate-pulse">
                智能校準
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              目前使用：{selectedPreset?.name || "自訂模式"} ({selectedPreset?.description})
            </p>
          </div>
        </div>
        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expandable contents */}
      {isOpen && (
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              1. 選擇生成摘要風格模型
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activePresetId === preset.id
                      ? "border-indigo-600 bg-white ring-2 ring-indigo-50"
                      : "border-slate-200 bg-slate-100/50 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="font-semibold text-xs block text-slate-800">
                    {preset.name}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block line-clamp-2">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Edit system instruction directly */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <FileCode2 className="w-3.5 h-3.5 text-slate-500" />
                2. 進階自訂 System Instructions 指引
              </label>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                設定此指引以約束 AI 輸出特定結構與行為
              </span>
            </div>
            <textarea
              value={customInstruction}
              onChange={(e) => onChangeCustomInstruction(e.target.value)}
              className="w-full h-36 p-3 text-xs font-mono bg-slate-900 text-slate-200 border border-slate-800 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="請在這裡輸入自訂的 System Instruction 指引..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
