import MessagesView from "@/components/MessagesView";

export default function UserMessagesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-50">Messages</h1>
      <p className="text-sm text-slate-400">
        Message trainers and organizers. Select a conversation or start one from an event.
      </p>
      <MessagesView />
    </div>
  );
}

