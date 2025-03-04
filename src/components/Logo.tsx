"use client";
import usePageCheck from "@/hooks/usePageCheck";
import Image from "next/image";

type LogoType = "main" | "pai" | "fai";

interface LogoProps {
  type: LogoType;
  className?: string;
  sizes?: string;
}

const Logo = ({ type, className, sizes }: LogoProps) => {
  const imageSrc = {
    main: "/logo/main.logo.svg",
    pai: "/logo/pai.svg",
    fai: "/logo/fai.svg"
  }[type];

  return (
    <div className={`inline-block ${className}`}>
      <div className="relative w-[2rem] h-[2rem] desktop:w-10 desktop:h-10">
        <Image
          src={imageSrc}
          fill
          alt="logo"
          priority
          className="object-contain"
          sizes={sizes || "(max-width: 1199px) 62px, 93px"}
        />
      </div>
    </div>
  );
};

export default Logo;
