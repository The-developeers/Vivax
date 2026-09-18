import Image from "next/image";
import { ImageIcon } from "lucide-react";

export function PlaceImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-mist ${className ?? ""}`}>
        <ImageIcon className="h-6 w-6 text-slate" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  );
}
