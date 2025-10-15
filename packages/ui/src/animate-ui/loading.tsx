function Loading() {
  return (
    <div className="flex size-full items-center justify-center">
      <div className="relative size-12">
        <div className="animate-jump-loading absolute inset-0 rounded-[4px] bg-gradient-to-br from-orange-300 to-orange-500"></div>
        <div className="animate-shadow-loading absolute left-0 top-[60px] h-[5px] w-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-500"></div>
      </div>
    </div>
  );
}

export { Loading };
