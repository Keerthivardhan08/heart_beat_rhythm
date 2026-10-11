
export function PredictionCard({ title, status }: { title: string; status: string }) {
  return <article className="panel"><h3>{title}</h3><p>{status}</p></article>;
}
