import { Link } from "react-router-dom";
import Card from "../ui/Card";
import PageHeader from "./PageHeader";

function PolicyPage({ title, description, intro, sections = [], links = [], actions }) {
  return (
    <div className="space-y-6 pb-12 font-sans">
      <PageHeader title={title} description={description} actions={actions} />

      {intro ? (
        <Card>
          {typeof intro === "string" ? <p className="text-sm leading-relaxed text-slate-600">{intro}</p> : intro}
        </Card>
      ) : null}

      {sections.length > 0 ? (
        <div className={`grid gap-6 ${sections.length > 1 ? "lg:grid-cols-2" : ""}`}>
          {sections.map((section) => (
            <Card key={section.title} title={section.title}>
              <div className="space-y-3 text-sm leading-relaxed text-slate-600">{section.content}</div>
            </Card>
          ))}
        </div>
      ) : null}

      {links.length > 0 ? (
        <Card title="Liên kết nhanh">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-black text-slate-900">{link.label}</p>
                {link.description ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{link.description}</p> : null}
              </Link>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

export default PolicyPage;
