export function SupabaseConfigWarning() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center text-card-foreground shadow-sm">
        <h1 className="text-2xl font-bold">Supabase Configuration Missing</h1>
        <p className="mt-2 text-muted-foreground">
          Project environment variables for Supabase are not set.
        </p>
        <p className="mt-4 text-sm">
          Please create a <code className="bg-muted px-1 py-0.5 rounded-sm">.env.local</code> file and add your Supabase URL and anonymous key.
        </p>
         <p className="mt-2 text-xs text-muted-foreground">Refer to the <code className="bg-muted px-1 py-0.5 rounded-sm">.env.example</code> file for the required variables.</p>
      </div>
    </div>
  );
}
