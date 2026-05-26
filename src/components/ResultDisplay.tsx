import { useState } from "react";
import Markdown from "react-markdown";
import { Copy, Check, FileDown, Globe, Sparkles } from "lucide-react";

interface ResultDisplayProps {
  result: string | null;
  loading: boolean;
  targetLanguage: string;
}

export default function ResultDisplay({ result, loading, targetLanguage }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("無法複製文字: ", err);
    }
  };

  const handleDownload = (format: "md" | "txt") => {
    if (!result) return;
    const element = document.createElement("a");
    const file = new Blob([result], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `會議總結與翻譯_${targetLanguage}.${format}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="border border-slate-200 bg-white rounded-2xl p-6 shadow-sm relative transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-800">
              AI 會議記錄生成與翻譯結果
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>翻譯語系：</span>
              <span className="font-semibold text-indigo-600 px-1.5 py-0.2 bg-indigo-50 rounded">
                {targetLanguage}
              </span>
            </div>
          </div>
        </div>

        {/* Action button options */}
        {result && !loading && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                copied
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  已複製！
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  一鍵複製
                </>
              )}
            </button>

            <button
              onClick={() => handleDownload("md")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all duration-200"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-500" />
              下載 Markdown
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="min-h-[220px] flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Elegant multi-layer loading animation */}
            <div className="absolute w-12 h-12 rounded-full border-4 border-indigo-200 animate-pulse" />
            <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <p className="font-medium text-sm text-slate-700">正在處理會議紀錄並進行翻譯...</p>
            <p className="text-xs text-slate-400 leading-normal animate-pulse">
              Gemini 正在讀取逐字稿、提煉精簡要點、劃分待辦清單，並將其轉譯為您的目標語言。
            </p>
          </div>
        </div>
      ) : result ? (
        <div className="bg-slate-50/50 hover:bg-slate-50/30 rounded-xl p-5 border border-slate-100 max-h-[580px] overflow-y-auto transition-all duration-300">
          <div className="markdown-body text-slate-800 text-sm leading-relaxed">
            <Markdown>{result}</Markdown>
          </div>
        </div>
      ) : (
        <div className="min-h-[220px] flex flex-col items-center justify-center p-8 bg-dashed bg-slate-100/30 rounded-xl border border-dashed border-slate-300 text-center">
          <Sparkles className="w-10 h-10 text-slate-300 mb-2" />
          <p className="font-medium text-sm text-slate-600">尚無生成結果</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            請在上方貼上您的會議材料，點擊「生成總結與翻譯」按鈕後，AI 的分析將渲染在此區。
          </p>
        </div>
      )}
    </div>
  );
}
