import { AspectRatio } from "@monorepo/ui";

export default function AspectRatioPreview() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">16:9 Aspect Ratio</h3>
        <AspectRatio
          ratio={16 / 9}
          className="bg-muted overflow-hidden rounded-md"
        >
          <img
            src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
            alt="Photo by Drew Beamer"
            className="h-full w-full object-cover"
          />
        </AspectRatio>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">1:1 Square</h3>
        <div className="w-[200px]">
          <AspectRatio
            ratio={1}
            className="bg-muted flex items-center justify-center rounded-md"
          >
            <span className="text-sm text-gray-500">1:1</span>
          </AspectRatio>
        </div>
      </div>
    </div>
  );
}
