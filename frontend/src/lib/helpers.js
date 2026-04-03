export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function getStatusLabel(status) {
  const mapping = {
    submitted: "Moi gui",
    reviewing: "Dang duyet",
    approved: "Da duyet",
    rejected: "Tu choi",
    deposit_pending: "Cho dat coc",
    deposit_paid: "Da dat coc",
    active: "Dang hieu luc",
    closed: "Da thanh ly",
  };

  return mapping[status] || status || "--";
}
