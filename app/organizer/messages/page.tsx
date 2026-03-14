import MessagesView from "@/components/MessagesView";

export default function OrganizerMessagesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-50">Messages</h1>
      <p className="text-sm text-slate-400">
        Coordinate with trainers and participants. Select a conversation below.
      </p>
      <MessagesView />
    </div>
  );
}

