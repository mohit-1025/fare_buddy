import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      hotkey={['altKey', 'KeyT']}
      expand
      visibleToasts={3}
      toastOptions={{
        classNames: {
          toast:
            'group rounded-xl border border-border bg-card text-foreground shadow-lift font-sans text-sm',
          title: 'font-semibold',
          description: 'text-muted-foreground',
          success: 'border-primary/20 [&_[data-icon]]:text-primary',
          error: 'border-destructive/25 [&_[data-icon]]:text-destructive',
          warning: 'border-warning/25 [&_[data-icon]]:text-warning',
          actionButton: '!bg-primary !text-white !font-semibold !rounded-lg',
          cancelButton: '!bg-secondary !text-foreground !font-semibold !rounded-lg',
        },
      }}
    />
  );
}
