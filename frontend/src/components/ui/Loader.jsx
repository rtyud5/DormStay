function Loader({ message = "Dang tai du lieu..." }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
      <span className="inline-block size-3 animate-pulse rounded-full bg-slate-900" />
      <span>{message}</span>
    </div>
  );
}

export default Loader;
