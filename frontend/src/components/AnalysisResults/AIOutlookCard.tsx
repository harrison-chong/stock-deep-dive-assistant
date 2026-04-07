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
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></span>
          <p className="text-gray-500">Generating AI analysis...</p>
        </div>
      </div>
    );
  }

  if (!data.ai_outlook) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600 mb-4">
          Get an AI-powered analysis of {data.ticker} based on technical and fundamental metrics.
        </p>
        <button
          onClick={onGenerateAI}
          disabled={loadingAI}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loadingAI ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Generating...
            </span>
          ) : (
            'Generate AI Analysis'
          )}
        </button>
        {errorAI && <ErrorAlert message={errorAI} />}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
            <p className="text-sm text-gray-500">
              {data.ticker} · {data.company_name}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-700 leading-relaxed">{data.ai_outlook.overall_summary}</p>
      </div>

      {/* Recommendation Banner */}
      <div
        className={`mb-6 p-4 rounded-lg border-2 ${
          data.ai_outlook.recommendation === 'Consider'
            ? 'bg-green-50 border-green-200'
            : data.ai_outlook.recommendation === 'Avoid'
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <span
              className={`text-2xl font-bold ${
                data.ai_outlook.recommendation === 'Consider'
                  ? 'text-green-700'
                  : data.ai_outlook.recommendation === 'Avoid'
                    ? 'text-red-700'
                    : 'text-yellow-700'
              }`}
            >
              {data.ai_outlook.recommendation}
            </span>
          </div>
          <p className="text-sm text-gray-700">{data.ai_outlook.recommendation_rationale}</p>
        </div>
      </div>
    </div>
  );
}
