import TicketAdminClientComponent from "./page.client";

export default async function Page({ params }) {
  const { ticket } = await params;

  return (
    <main className="flex flex-col py-8 bg-background max-w-2xl mx-auto gap-4">
      <TicketAdminClientComponent id={ticket} />
    </main>
  );
}
