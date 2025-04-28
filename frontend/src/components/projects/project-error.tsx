import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

interface ProjectErrorProps {
  message: string;
}

export function ProjectError({ message }: ProjectErrorProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <Alert variant="destructive" className="mb-6 max-w-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Button
          onClick={() => router.refresh()}
          className="bg-primary-cta text-primary-text hover:bg-cta-hover"
        >
          Try Again
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/projects")}
          className="border-divider"
        >
          Return to Projects
        </Button>
      </div>
    </div>
  );
}
