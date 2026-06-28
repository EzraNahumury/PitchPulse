import MatchView from "./MatchView";

// Next 16: params is async.
export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MatchView fixtureId={Number(id)} />;
}
