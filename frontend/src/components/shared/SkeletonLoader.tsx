import { memo } from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = memo(function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full ${className}`}
      aria-hidden="true"
    />
  );
});

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton = memo(function TableSkeleton({
  rows = 5,
  columns = 6,
}: TableSkeletonProps) {
  return (
    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-200/30 dark:border-gray-800/30 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200/30 dark:border-gray-800/30 bg-gray-50/30 dark:bg-gray-800/30">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-5 py-3.5 text-left">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/50 dark:divide-gray-800/50">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-5 py-4">
                  <Skeleton
                    className={`h-4 ${colIndex === 0 ? 'w-20' : colIndex === 1 ? 'w-14' : 'w-18'}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

interface CardSkeletonProps {
  cards?: number;
}

export const CardSkeleton = memo(function CardSkeleton({ cards = 4 }: CardSkeletonProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-xl p-5 border border-gray-200/30 dark:border-gray-800/30"
        >
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-7 w-14" />
        </div>
      ))}
    </div>
  );
});
