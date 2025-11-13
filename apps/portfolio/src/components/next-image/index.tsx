"use client";

import type { ImageProps } from "next/image";
import React from "react";
import Image from "next/image";
import { cn } from "@monorepo/ui/libs/cn";

export interface NextImageProps extends ImageProps {
  imageClassName?: string;
  ref?: React.Ref<HTMLDivElement>;
  imageRef?: React.Ref<HTMLImageElement | null> | undefined;
}

const NextImage = ({
  src,
  alt,
  ref,
  imageRef,
  className,
  imageClassName,
  height,
  width,
  ...props
}: NextImageProps) => {
  return (
    <div ref={ref} className={cn("relative", className)}>
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={height && width ? false : true}
        quality={90}
        unoptimized={props.unoptimized || src.toString().includes(".svg")}
        className={cn(imageClassName)}
        {...props}
      />
    </div>
  );
};

export { NextImage };
