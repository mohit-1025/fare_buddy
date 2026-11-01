import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went sideways',
  description = 'We couldn’t load this right now. Check your connection and try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={<AlertTriangle className="h-6 w-6" />}
      title={title}
      description={description}
      tone="warning"
      action={
        onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        ) : undefined
      }
    />
  );
}
