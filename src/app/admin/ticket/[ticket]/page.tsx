import TicketAdminClientComponent from "./page.client";

interface PageProps {
  params: {
    ticket: string;
    [key: string]: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { ticket } = params;

  return (
    <main className="flex flex-col py-8 bg-background max-w-2xl mx-auto gap-4">
      <TicketAdminClientComponent id={ticket} />
    </main>
  );
}
