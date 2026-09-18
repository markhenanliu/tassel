import { notFound } from "next/navigation";
import { sendMessage } from "@/app/actions";
import { BookingHeader } from "@/components/booking-header";
import { btn, EmptyState, input, Notice } from "@/components/ui";
import { bookingView } from "@/lib/booking-view";
import { bookingById, threadClosed, userById } from "@/lib/derive";
import { dateTimeLabel } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function MessagesPage({ params }: PageProps<"/bookings/[id]/messages">) {
  const { id } = await params;
  const { data, viewer } = await getSession();
  const b = bookingById(data, id);
  if (!b) notFound();
  const v = bookingView(data, b, viewer);
  if (!v.role || !viewer) {
    return <EmptyState title="This thread belongs to someone else" body="Switch to the student or photographer on this booking to see it." />;
  }
  const thread = data.messages
    .filter((m) => m.bookingId === b.id)
    .sort((x, y) => Date.parse(x.sentAt) - Date.parse(y.sentAt));
  const closed = threadClosed(b);

  return (
    <div className="mx-auto max-w-2xl">
      <BookingHeader b={b} v={v} active="messages" />
      {thread.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-500">
          No messages yet. Use this thread to settle location details, who is coming, and timing.
        </p>
      ) : (
        <ul className="space-y-3">
          {thread.map((m) => {
            const mine = m.senderUserId === viewer.id;
            return (
              <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-stone-900 text-white" : "border border-stone-200 bg-white"}`}>
                  <p>{m.body}</p>
                  <p className={`mt-1 text-[11px] ${mine ? "text-stone-300" : "text-stone-500"}`}>
                    {mine ? "You" : userById(data, m.senderUserId)?.name} · {dateTimeLabel(m.sentAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-6">
        {closed ? (
          <Notice>This request is {b.status}. The thread is kept for reference and can&apos;t receive new messages.</Notice>
        ) : (
          <form action={sendMessage} className="flex gap-2">
            <input type="hidden" name="bookingId" value={b.id} />
            <input name="body" required maxLength={280} placeholder={`Message ${v.other.name.split(" ")[0]}`} className={input} />
            <button className={btn.primary}>Send</button>
          </form>
        )}
      </div>
    </div>
  );
}
