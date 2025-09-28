import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center">
       <Image
        src="/image_logo.png"
        alt="Logo"
        width={64}
        height={64}
        className="rounded-lg"
      />
    </div>
  );
}
