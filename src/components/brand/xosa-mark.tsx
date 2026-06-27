import Image from "next/image";

export function XosaMark({
  className = "",
  priority = false,
  variant = "white"
}: {
  className?: string;
  priority?: boolean;
  variant?: "white" | "red";
}) {
  return (
    <Image
      alt="XOSA"
      className={`xosa-logo h-auto w-full ${className}`}
      height={431}
      priority={priority}
      src={variant === "red" ? "/assets/xosa-logo-red.webp" : "/assets/xosa-logo-white.webp"}
      width={1200}
    />
  );
}
