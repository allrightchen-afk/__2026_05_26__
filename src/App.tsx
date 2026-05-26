import { useState, useEffect } from "react";
import { SYSTEM_INSTRUCTION_PRESETS, TRANSCRIPT_PRESETS } from "./data/samples";
import { HistoryItem, TranscriptPreset } from "./types";
import PresetList from "./components/PresetList";
import SystemInstructionEditor from "./components/SystemInstructionEditor";
import ResultDisplay from "./components/ResultDisplay";
import HistorySidebar from "./components/HistorySidebar";

// Icons
import { 
  Sparkles, 
  FileText, 
  Globe, 
  Trash2, 
  Brain, 
  Zap, 
  Languages, 
  Info,
  Layers,
  ClipboardPaste,
  RotateCcw
} from "lucide-react";

const TARGET_LANGUAGES = [
  { code: "繁體中文", label: "繁體中文 (原語系對照)" },
  { code: "英文 (English)", label: "英文 (English)" },
  { code: "日文 (日本語)", label: "日文 (日本語)" },
  { code: "韓文 (한국어)", label: "韓文 (한국어)" },
  { code: "西班牙文 (Español)", label: "西班牙文 (Español)" },
  { code: "越南文 (Tiếng Việt)", label: "越南文 (Tiếng Việt)" },
];

export default function App() {
  // Input & Settings State
  const [inputText, setInputText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("英文 (English)");
  const [activeInstructionId, setActiveInstructionId] = useState("comprehensive");
  const [customInstruction, setCustomInstruction] = useState("");
  const [tempReportTitle, setTempReportTitle] = useState("");

  // Result & UI State
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // History State
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // First-time load: load custom instruction from comprehensive preset
  useEffect(() => {
    const compPreset = SYSTEM_INSTRUCTION_PRESETS.find((p) => p.id === "comprehensive");
    if (compPreset) {
      setCustomInstruction(compPreset.instruction);
    }
  }, []);

  // Sync custom instruction when changing standard presets
  const handleSelectInstructionPreset = (id: string) => {
    setActiveInstructionId(id);
    const selected = SYSTEM_INSTRUCTION_PRESETS.find((p) => p.id === id);
    if (selected) {
      setCustomInstruction(selected.instruction);
    }
  };

  // Load History from Local Storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ai_meeting_history");
      if (stored) {
        setHistoryList(JSON.parse(stored));
      }
    } catch (err) {
      console.error("無法自 localStorage 撈取歷史資料", err);
    }
  }, []);

  // Save preset to main text area
  const handleSelectPresetTranscript = (preset: TranscriptPreset) => {
    setSelectedPresetId(preset.id);
    setInputText(preset.content);
    setTempReportTitle(preset.title.replace(/[🚀📢⚕️]/g, "").trim());
    setErrorMsg(null);
  };

  // Trigger clipboard paste
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        setSelectedPresetId(null);
        setTempReportTitle("自署會議資料_" + new Date().toLocaleDateString("zh-TW"));
        setErrorMsg(null);
      }
    } catch (err) {
      setErrorMsg("因瀏覽器安全限制，請直接使用 Ctrl+V 貼上文字。");
    }
  };

  // Clear inputs
  const handleClearInputs = () => {
    setInputText("");
    setSelectedPresetId(null);
    setTempReportTitle("");
    setErrorMsg(null);
  };

  // Main Submit Call to Server Express API
  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setErrorMsg("請先貼上或載入會議記錄逐字稿內容。");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: inputText,
          targetLanguage: targetLanguage,
          systemInstruction: customInstruction,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生成失敗，請稍後再試。");
      }

      setResult(data.result);

      // Create a unique report title
      const finalizedTitle = tempReportTitle.trim() || "會議摘要報告_" + new Date().toLocaleDateString("zh-TW");

      // Save to History List
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        title: finalizedTitle,
        timestamp: new Date().toLocaleString("zh-TW", {
          hour12: false,
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        inputLength: inputText.length,
        output: data.result,
        targetLanguage: targetLanguage,
      };

      const updatedHistory = [newItem, ...historyList].slice(0, 15); // limit to last 15 items
      setHistoryList(updatedHistory);
      localStorage.setItem("ai_meeting_history", JSON.stringify(updatedHistory));

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "與後端 API 伺服器對接時發生未預期的網頁錯誤。");
    } finally {
      setLoading(false);
    }
  };

  // Select item from history
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setResult(item.output);
    setTargetLanguage(item.targetLanguage);
    setErrorMsg(null);
  };

  // Delete specific history item
  const handleDeleteHistoryItem = (id: string) => {
    const updated = historyList.filter((item) => item.id !== id);
    setHistoryList(updated);
    localStorage.setItem("ai_meeting_history", JSON.stringify(updated));
  };

  // Clear all history
  const handleClearAllHistory = () => {
    if (confirm("您確定要刪除所有本機歷史紀錄嗎？這項動作無法還原。")) {
      setHistoryList([]);
      localStorage.removeItem("ai_meeting_history");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100/60 transition-transform hover:scale-105">
                <Brain className="w-5.5 h-5.5" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
                  智匯議 AI Meeting Master
                </h1>
                <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">
                  會議紀錄自動生成與多語系翻譯 · 基於 <span className="text-indigo-600">Gemini 3.5 Flash</span>
                </p>
              </div>
            </div>

            {/* Platform indicator badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 text-slate-600 text-xs border border-slate-200">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium">API 連線正常 🚀</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        {/* Intro Tip Box (Optional/Helpful Info) */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100/80 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <strong className="font-semibold text-slate-900 block mb-0.5">💡 快速啟動說明</strong>
            您可以直接在底下點選預設的會議範例逐字稿，或是手動貼上跨部門對話，接著在工具中挑選您要翻譯的核心多語系與摘要排版風格，隨後交給 Gemini 一鍵整理出格式精緻的 Markdown 表格、議題決議與待辦。
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDE: Inputs and parameters (7 cols) */}
          <div className="col-span-1 lg:col-span-7 space-y-6">
            
            {/* Presets Grid */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                會議逐字稿範本
              </h2>
              <PresetList
                presets={TRANSCRIPT_PRESETS}
                selectedPresetId={selectedPresetId}
                onSelectPreset={handleSelectPresetTranscript}
              />
            </div>

            {/* Main Interactive Textarea Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    會議逐字稿 / 筆記材料輸入區
                  </h2>
                  <p className="text-xs text-slate-400">貼上長篇錄音文本，長度上限約 15 MB</p>
                </div>
                
                {/* Auxiliary quick action buttons */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all active:scale-95"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5 text-slate-500" />
                    從剪貼簿貼上
                  </button>
                  <button
                    type="button"
                    onClick={handleClearInputs}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-500 border border-slate-200/60 transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    清除重置
                  </button>
                </div>
              </div>

              {/* Title helper for History saving */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">本份會議命名：</span>
                  <span className="text-[10px] text-slate-400">非必填，保存進紀錄用</span>
                </div>
                <input
                  type="text"
                  value={tempReportTitle}
                  onChange={(e) => setTempReportTitle(e.target.value)}
                  placeholder="例如：智慧零售 App 第三季功能規劃會議..."
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300 outline-none text-slate-700 bg-slate-50/50"
                />
              </div>

              {/* Huge Input Textarea */}
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="請在此貼上您的會議逐字稿（如 Zoom、Google Meet、Teams 的導出字幕、對話紀錄，或手寫記錄草稿）..."
                  className="w-full h-80 px-5 py-4 text-slate-700 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none placeholder:text-slate-300 font-sans leading-relaxed outline-none"
                />
                
                {/* Character Counter */}
                <div className="absolute bottom-4 right-4 px-2.5 py-1 bg-slate-900/10 text-slate-600 text-[10px] rounded-md font-mono pointer-events-none">
                  {inputText.length.toLocaleString()} 字
                </div>
              </div>

              {/* Bottom control row: Select translation Language & Generator Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                
                {/* Target translation dropdown */}
                <div className="flex items-center gap-2 max-w-xs">
                  <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-500 shrink-0">翻譯語系：</span>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-700 cursor-pointer font-medium"
                  >
                    {TARGET_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Main Submit Action Button with loading state */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading || !inputText.trim()}
                  className={`group font-semibold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95 text-sm ${
                    loading
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300"
                      : !inputText.trim()
                      ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200/80 hover:shadow-lg cursor-pointer"
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : "group-hover:animate-pulse text-indigo-200"}`} />
                  <span>{loading ? "正在總結翻譯中..." : "生成總結與翻譯"}</span>
                </button>
              </div>

              {/* Error banner indicator */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-start gap-1.5 leading-snug">
                  <span className="font-bold shrink-0">⚠️ 錯誤提示：</span>
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Custom System Instruction settings panel */}
            <SystemInstructionEditor
              presets={SYSTEM_INSTRUCTION_PRESETS}
              activePresetId={activeInstructionId}
              customInstruction={customInstruction}
              onSelectPreset={handleSelectInstructionPreset}
              onChangeCustomInstruction={setCustomInstruction}
            />

          </div>

          {/* RIGHT SIDE: Outputs render & Historical sessions (5 cols) */}
          <div className="col-span-1 lg:col-span-5 space-y-6">
            
            {/* Dynamic Results block */}
            <ResultDisplay
              result={result}
              loading={loading}
              targetLanguage={targetLanguage}
            />

            {/* Session Logs Panel */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                大會紀錄庫
              </h2>
              <HistorySidebar
                history={historyList}
                onSelect={handleSelectHistoryItem}
                onDelete={handleDeleteHistoryItem}
                onClearAll={handleClearAllHistory}
              />
            </div>

          </div>

        </div>
      </main>

      {/* Elegant Footer */}
      <footer className="h-14 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[11px] text-slate-400 mt-12">
        <div className="flex items-center space-x-4">
          <span>系統設定指引：已啟用 🚀</span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            工作台沙盒運作良好
          </span>
        </div>
        <div>&copy; 2026 SmartMeeting AI . All rights reserved.</div>
      </footer>
    </div>
  );
}
