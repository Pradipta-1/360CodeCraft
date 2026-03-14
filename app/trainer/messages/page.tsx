import { Suspense } from "react";
import MessagesView from "@/components/MessagesView";

export default function TrainerMessagesPage() {
  return (
    <div id="messages" className="tab-pane active">
      <div className="card">
        <h1 className="card-title">Messages</h1>
        <p className="card-subtitle">
          Chat with organizers and clients. Select a conversation below.
        </p>
      </div>
      <div className="card">
        <Suspense fallback={<div className="p-4 text-slate-400">Loading messages...</div>}>
          <MessagesView />
        </Suspense>
      </div>
    </div>
  );
}

