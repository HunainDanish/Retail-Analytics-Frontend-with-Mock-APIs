export function AuthLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="text-center">
        <div className="relative mx-auto mb-3 h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
