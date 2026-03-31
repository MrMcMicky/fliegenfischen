import Image from "next/image";

type AdminPreviewImageProps = {
  src: string;
  alt: string;
  wrapperClassName: string;
  className?: string;
  sizes?: string;
};

export function AdminPreviewImage({
  src,
  alt,
  wrapperClassName,
  className = "object-cover",
  sizes = "100vw",
}: AdminPreviewImageProps) {
  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes={sizes}
        className={className}
      />
    </div>
  );
}
