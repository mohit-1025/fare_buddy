import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { BrandLockup } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';

export function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <BrandLockup />
        </div>
        <EmptyState
          icon={<Compass className="h-6 w-6" />}
          title="This corner of campus doesn’t exist"
          description="The page you’re looking for moved or was never here. Head back to your pools."
          action={
            <Button asChild>
              <Link to="/cart">Back to Cart Pool</Link>
            </Button>
          }
        />
      </div>
    </div>
  );
}
