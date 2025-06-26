import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mountain } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center shadow-md">
        <Mountain className="h-6 w-6 mr-3" />
        <h1 className="text-xl font-semibold font-headline">Project Genesis</h1>
      </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Welcome!</CardTitle>
              <CardDescription>
                This is your initial dashboard view for Project Genesis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-body">Hello, World!</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
