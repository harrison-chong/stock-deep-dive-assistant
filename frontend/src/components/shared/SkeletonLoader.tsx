import { memo } from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = memo(function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} aria-hidden="true" />;
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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3 text-left">
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <Skeleton
                    className={`h-4 ${colIndex === 0 ? 'w-24' : colIndex === 1 ? 'w-16' : 'w-20'}`}
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
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
});
