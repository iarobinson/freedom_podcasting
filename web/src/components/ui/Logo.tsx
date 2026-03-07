import Image from "next/image";

interface Props {
  size?: number;
  className?: string;
}

export function Logo({ size = 20, className }: Props) {
  return (
    <Image
      src="/freedom-podcasting-square-logo.png"
      alt="FreedomPodcasting"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
