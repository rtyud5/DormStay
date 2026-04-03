function Card({ title, description, children, actions }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      {(title || description || actions) && (
        <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
          <div>
            {title ? <h2 className="text-lg font-semibold text-slate-900">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

export default Card;
