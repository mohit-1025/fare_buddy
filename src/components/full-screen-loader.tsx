import { BrandMark } from '@/components/brand';

export function FullScreenLoader({ label = 'Getting your campus ready…' }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-[14px] bg-primary/15" />
          <BrandMark className="relative h-14 w-14 rounded-2xl" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold">FareBuddy</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: `${index * 120}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
