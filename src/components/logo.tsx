import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center gap-2.5 text-primary font-semibold tracking-tighter">
       <Image
        src="/image.png"
        alt="CORPOTACHIRA MANAGER Logo"
        width={32}
        height={32}
        className="rounded-lg"
      />
      <span className="text-base group-data-[collapsible=icon]:hidden">
        CORPOTACHIRA MANAGER
      </span>
    </div>
  );
}
