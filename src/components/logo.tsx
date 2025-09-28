import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center">
       <Image
        src="/image_logo.png"
        alt="Logo"
        width={80}
        height={80}
        className="rounded-lg"
      />
    </div>
  );
}
