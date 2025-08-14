import "./loading.css";

export default function Loading() {
  return (
    <div className="flex items-center justify-center size-full">
      <div className="relative size-12">
        <div className="absolute inset-0 rounded-[4px] bg-gradient-to-br from-orange-300 to-orange-500 animate-jump-loading"></div>
        <div className="absolute left-0 top-[60px] w-12 h-[5px] rounded-full bg-gradient-to-r from-orange-400 to-orange-500 animate-shadow-loading"></div>
      </div>
    </div>
  );
}
