import { Avatar, AvatarFallback, AvatarImage } from "@monorepo/ui";

export default function AvatarPreview() {
  return (
    <div className="flex flex-col gap-6">
      {/* With Image */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">With Image</h3>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Fallback */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Fallback</h3>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>XY</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Sizes (using className) */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Sizes</h3>
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">SM</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>MD</AvatarFallback>
          </Avatar>
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">LG</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
