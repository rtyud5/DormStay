function Tabs({ items = [], activeKey, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = item.key === activeKey;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
