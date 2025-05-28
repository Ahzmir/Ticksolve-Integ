import TicketClientComponent from "./page.client";

export default async function Page({ params }: { params: { ticket: string } }) {
  const { ticket } = params;

  return (
    <main className="flex flex-col py-8 bg-background max-w-2xl mx-auto gap-4">
      <TicketClientComponent id={ticket} />
    </main>
  );
}
