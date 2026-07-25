import Link from "next/link";

export function AccessDenied({
  message = "this page requires System Administrator access",
}: {
  message?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-lg font-medium text-foreground">
        Access Denied — {message}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Back to Overview
      </Link>
    </div>
  );
}
