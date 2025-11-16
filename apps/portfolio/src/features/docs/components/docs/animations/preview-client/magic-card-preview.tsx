"use client";

import { useTheme } from "next-themes";

import { MagicCard } from "@monorepo/ui/animate-ui/magic-card";
import { Button } from "@monorepo/ui/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/shadcn-ui/card";

const MagicCardPreview = () => {
  const { theme } = useTheme();

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-sm border-none p-0 shadow-none">
        <MagicCard
          gradientColor={theme === "dark" ? "#262626" : "#d9d9d9"}
          className="p-0"
        >
          <CardHeader className="border-border border-b p-4 [.border-b]:pb-4">
            <CardTitle>Magic Card</CardTitle>
            <CardDescription>
              Magic Card is a component that creates a magic card effect.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <p>Magic Card Content</p>
          </CardContent>
          <CardFooter className="border-border border-t p-4 [.border-t]:pt-4">
            <Button className="w-full">Button</Button>
          </CardFooter>
        </MagicCard>
      </Card>
    </div>
  );
};

export default MagicCardPreview;
