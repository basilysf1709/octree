import { Button } from '@/components/ui/button';

export default function Menu() {
  return (
    <div className="bg-background flex h-fit items-center gap-1 rounded-md border p-1 shadow-xs">
      <Button variant="ghost" size="xs">
        Compile
      </Button>
      <Button variant="ghost" size="xs">
        Export
      </Button>
    </div>
  );
}
