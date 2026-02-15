import LoadingSpinner from "@/components/loading-spinner";

export default function Loading() {
  return (
    <div className="container min-h-[50vh] flex items-center justify-center py-20">
      <LoadingSpinner size="lg" label="Laddar..." className="text-sky-600" />
    </div>
  );
}

