import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

interface ToolCardProps {
  /** The wire name a client calls — code, so it is never translated. */
  name: string;
  title: string;
  description: string;
}

/**
 * One tool as the endpoint advertises it. Not a link: `/api/mcp` answers
 * JSON-RPC over POST, so anything pointing a browser at it would render a 405.
 */
export default function ToolCard({ name, title, description }: ToolCardProps) {
  return (
    <Card className="h-full gap-0 py-5">
      <CardHeader className="px-5">
        {/* `CardTitle` renders a plain div, so the heading element is spelled
            out here: without it a tool name is not reachable by heading-role
            navigation. The page's own <h1> is the app title, and the section
            above these cards is the <h2>, so each card sits at level 3. */}
        <CardTitle className="text-base">
          <h3>{title}</h3>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pt-3">
        <code className="rounded bg-accent px-2 py-1 font-mono text-sm text-accent-foreground">
          {name}
        </code>
      </CardContent>
    </Card>
  );
}
