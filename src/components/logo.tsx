import { Building } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2.5 text-primary font-semibold tracking-tighter">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Building className="h-5 w-5" />
      </div>
      <span className="text-base group-data-[collapsible=icon]:hidden">
        CORPOTACHIRA MANAGER
      </span>
    </div>
  );
}
