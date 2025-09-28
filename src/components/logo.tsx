import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center">
       <Image
        src="/image_logo.png"
        alt="Logo"
        width={100}
        height={100}
        className="rounded-lg"
      />
    </div>
  );
}
