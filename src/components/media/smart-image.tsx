/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { isValidHttpUrl } from "@/lib/url";

type SmartImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

export function SmartImage({ src, alt, width, height, className, priority }: SmartImageProps) {
  const canOptimize =
    src.startsWith("/") ||
    src.includes(".supabase.co") ||
    src.includes("i.scdn.co") ||
    src.includes("is1-ssl.mzstatic.com") ||
    src.includes("img.youtube.com");

  if (canOptimize) {
    return <Image alt={alt} className={className} height={height} priority={priority} src={src} width={width} />;
  }

  if (isValidHttpUrl(src)) {
    return <img alt={alt} className={className} height={height} loading={priority ? "eager" : "lazy"} src={src} width={width} />;
  }

  return null;
}
