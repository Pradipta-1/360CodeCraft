import { Suspense } from "react";
import OrganizerShell from "@/components/OrganizerShell";
import MessagesView from "@/components/MessagesView";

export default function OrganizerMessagesPage() {
  return (
    <OrganizerShell>
      <div id="messages" className="tab-pane active">
        <div className="card">
          <h1 className="card-title">Messages</h1>
          <p className="card-subtitle">
            Coordinate with trainers and participants. Select a conversation below.
          </p>
        </div>
        <div className="card">
          <Suspense fallback={<div className="p-4 text-slate-400">Loading messages...</div>}>
            <MessagesView />
          </Suspense>
        </div>
      </div>
    </OrganizerShell>
  );
}
