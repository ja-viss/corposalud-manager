import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center">
       <Image
        src="/image.png"
        alt="Logo"
        width={32}
        height={32}
        className="rounded-lg"
      />
    </div>
  );
}
