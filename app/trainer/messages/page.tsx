import MessagesView from "@/components/MessagesView";

export default function TrainerMessagesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-50">Messages</h1>
      <p className="text-sm text-slate-400">
        Chat with organizers and clients. Select a conversation below.
      </p>
      <MessagesView />
    </div>
  );
}

