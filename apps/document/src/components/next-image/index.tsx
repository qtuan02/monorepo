"use client";

import type { ImageProps } from "next/image";
import type React from "react";
import { forwardRef } from "react";
import Image from "next/image";

import { cn } from "@monorepo/ui/libs/cn";

export interface INextImageProps extends Omit<ImageProps, "ref"> {
  imageClassName?: string;
  imageRef?: React.Ref<HTMLImageElement>;
}

const NextImage = forwardRef<HTMLDivElement, INextImageProps>(
  (
    {
      src,
      alt,
      imageRef,
      className,
      imageClassName,
      height,
      width,
      quality = 90,
      unoptimized,
      ...props
    },
    ref,
  ) => {
    // Determine if we should use fill mode
    const isFill = !height || !width;

    // Check if src is an SVG (handles string, StaticImageData, and other types)
    const isSvg =
      typeof src === "string"
        ? src.includes(".svg")
        : "src" in src && typeof src.src === "string"
          ? src.src.includes(".svg")
          : false;

    return (
      <div ref={ref} className={cn("relative", className)}>
        <Image
          ref={imageRef}
          src={src}
          alt={alt ?? ""}
          {...(isFill
            ? { fill: true }
            : {
                width,
                height,
              })}
          quality={quality}
          unoptimized={unoptimized ?? isSvg}
          className={imageClassName}
          {...props}
        />
      </div>
    );
  },
);

NextImage.displayName = "NextImage";

export { NextImage };
