import { Suspense } from "react";
import MessagesView from "@/components/MessagesView";
import UserShell from "@/components/UserShell";

export default function UserMessagesPage() {
  return (
    <UserShell>
      <div id="messages" className="tab-pane">
        <div className="card">
          <h1 className="card-title">Messages</h1>
          <p className="card-subtitle">
            Message trainers and organizers. Select a conversation or start one from an event.
          </p>
        </div>
        <div className="card">
          <Suspense fallback={<div className="p-4 text-slate-400">Loading messages...</div>}>
            <MessagesView />
          </Suspense>
        </div>
      </div>
    </UserShell>
  );
}

