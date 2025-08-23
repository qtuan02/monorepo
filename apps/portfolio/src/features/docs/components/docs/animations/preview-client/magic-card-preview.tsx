"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@web/ui/shadcn-ui/card";
import { Button } from "@web/ui/shadcn-ui/button";
import { MagicCard } from "@web/ui/animate-ui/magic-card";
import { useTheme } from "next-themes";

const MagicCardPreview = () => {
  const { theme } = useTheme();

  return (
    <div className="flex justify-center">
      <Card className="p-0 max-w-sm w-full shadow-none border-none">
        <MagicCard
          gradientColor={theme === "dark" ? "#262626" : "#d9d9d9"}
          className="p-0"
        >
          <CardHeader className="border-b border-border p-4 [.border-b]:pb-4">
            <CardTitle>Magic Card</CardTitle>
            <CardDescription>
              Magic Card is a component that creates a magic card effect.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <p>Magic Card Content</p>
          </CardContent>
          <CardFooter className="p-4 border-t border-border [.border-t]:pt-4">
            <Button className="w-full">Button</Button>
          </CardFooter>
        </MagicCard>
      </Card>
    </div>
  );
};


export default MagicCardPreview;
