"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLinkIcon, GithubIcon } from "lucide-react";

import { Badge } from "@monorepo/ui/components/badge";
import { cn } from "@monorepo/ui/libs/cn";

interface ProjectCardProps {
  title: string;
  description: string;
  techStack: string[];
  github?: string;
  demo?: string;
  image?: string;
  type?: string;
}

export function ProjectCard({
  title,
  description,
  techStack,
  github,
  demo,
  image,
  type,
}: ProjectCardProps) {
  return (
    <div
      className={cn(
        "group border-border bg-card relative flex h-full flex-col overflow-hidden rounded-lg border transition-all duration-300",
        "hover:border-foreground/20 hover:shadow-md",
      )}
    >
      {/* Image Preview */}
      {image && (
        <div className="border-border bg-muted relative aspect-video w-full overflow-hidden border-b">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Type Badge */}
          {type && (
            <div className="absolute top-2 right-2">
              <Badge
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm",
                  type === "Company"
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-green-500 text-white hover:bg-green-600",
                )}
              >
                {type}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Title */}
        <h3 className="group-hover:text-foreground/80 mb-2 text-base leading-tight font-semibold transition-colors duration-200">
          {title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground mb-4 flex-1 text-sm leading-relaxed">
          {description}
        </p>

        {/* Tech Stack */}
        <div className="mb-4 flex flex-wrap gap-1">
          {techStack.map((tech, index) => (
            <Badge
              key={`${title}-${tech}-${index}`}
              variant="secondary"
              className="rounded-sm px-1.5 py-0.5 text-xs font-normal"
            >
              {tech}
            </Badge>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-2">
          {github && (
            <Link
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "border-border bg-background flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-all duration-200",
                "hover:bg-muted hover:border-foreground/20",
              )}
            >
              <GithubIcon className="size-3.5" />
              <span>Code</span>
            </Link>
          )}

          {demo && (
            <Link
              href={demo}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "border-foreground bg-foreground text-background flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-all duration-200",
                "hover:bg-foreground/90",
              )}
            >
              <ExternalLinkIcon className="size-3.5" />
              <span>Website</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
