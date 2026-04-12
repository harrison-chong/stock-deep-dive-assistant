import { AnalysisData } from '../../types/analysis';
import { ErrorAlert } from '../shared/ErrorAlert';

interface AIOutlookCardProps {
  data: AnalysisData;
  loadingAI: boolean;
  errorAI?: string;
  onGenerateAI?: () => void;
}

export function AIOutlookCard({ data, loadingAI, errorAI, onGenerateAI }: AIOutlookCardProps) {
  if (loadingAI) {
    return (
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-12 text-center animate-pulse border border-gray-200/30 dark:border-gray-800/30">
        <div className="w-8 h-8 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700" />
        <p className="text-gray-400 dark:text-gray-500">Generating AI analysis...</p>
      </div>
    );
  }

  if (!data.ai_outlook) {
    return (
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-12 text-center border border-gray-200/30 dark:border-gray-800/30">
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Get an AI-powered analysis of {data.ticker}
        </p>
        <button
          onClick={onGenerateAI}
          disabled={loadingAI}
          className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
        >
          Generate AI Analysis
        </button>
        {errorAI && <ErrorAlert message={errorAI} />}
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 animate-fade-in border border-gray-200/30 dark:border-gray-800/30">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Outlook</h3>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-900/30 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            AI Generated
          </span>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="mb-6 p-4 bg-gray-50/60 dark:bg-gray-800/50 rounded-xl border border-gray-200/30 dark:border-gray-700/30">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {data.ai_outlook.overall_summary}
        </p>
      </div>

      {/* Bull Case */}
      <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50/60 to-green-50/40 dark:from-emerald-900/30 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <h4 className="text-xs font-semibold text-green-800 dark:text-green-300 uppercase tracking-wide">
            Bull Case
          </h4>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300">{data.ai_outlook.bull_case}</p>
      </div>

      {/* Bear Case */}
      <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-red-50/60 to-rose-50/40 dark:from-red-900/30 dark:to-rose-900/20 border border-red-200/50 dark:border-red-800/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <h4 className="text-xs font-semibold text-red-800 dark:text-red-300 uppercase tracking-wide">
            Bear Case
          </h4>
        </div>
        <p className="text-sm text-red-700 dark:text-red-300">{data.ai_outlook.bear_case}</p>
      </div>

      {/* Neutral Scenario */}
      <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-amber-50/60 to-yellow-50/40 dark:from-amber-900/30 dark:to-yellow-900/20 border border-amber-200/50 dark:border-amber-800/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
            Neutral Scenario
          </h4>
        </div>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          {data.ai_outlook.neutral_scenario}
        </p>
      </div>

      {/* Risk Factors */}
      {data.ai_outlook.risk_factors.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-gray-50/60 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/30">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
            Risk Factors
          </h4>
          <ul className="space-y-1">
            {data.ai_outlook.risk_factors.map((risk, index) => (
              <li
                key={index}
                className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
              >
                <span className="text-gray-400 dark:text-gray-500">•</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendation Banner */}
      <div
        className={`p-4 rounded-xl border ${
          data.ai_outlook.recommendation === 'Consider'
            ? 'bg-gradient-to-br from-emerald-50/60 to-green-50/40 dark:from-emerald-900/30 dark:to-green-900/20 border-emerald-200/50 dark:border-emerald-800/30'
            : data.ai_outlook.recommendation === 'Avoid'
              ? 'bg-gradient-to-br from-red-50/60 to-rose-50/40 dark:from-red-900/30 dark:to-rose-900/20 border-red-200/50 dark:border-red-800/30'
              : 'bg-gradient-to-br from-amber-50/60 to-yellow-50/40 dark:from-amber-900/30 dark:to-yellow-900/20 border-amber-200/50 dark:border-amber-800/30'
        }`}
      >
        <div className="flex items-center gap-4">
          <span
            className={`text-2xl font-semibold ${
              data.ai_outlook.recommendation === 'Consider'
                ? 'text-green-700 dark:text-green-300'
                : data.ai_outlook.recommendation === 'Avoid'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-amber-700 dark:text-amber-300'
            }`}
          >
            {data.ai_outlook.recommendation}
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.ai_outlook.recommendation_rationale}
          </p>
        </div>
      </div>
    </div>
  );
}
