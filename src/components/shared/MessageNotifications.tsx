import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, onSnapshot, orderBy, query, where, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

// Listens for new messages in chats where the current user is a member
// and displays a toast + optional browser notification.
const MessageNotifications = () => {
  const [myId, setMyId] = useState<string>(auth.currentUser?.uid || "");
  const [chatIds, setChatIds] = useState<string[]>([]);
  const initializedChatsRef = useRef<Set<string>>(new Set());
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Track auth user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setMyId(u?.uid || ""));
    return () => unsub();
  }, []);

  // Subscribe to chats containing me
  useEffect(() => {
    if (!myId) return;
    const q = query(collection(db, "chats"), where("members", "array-contains", myId));
    const unsub = onSnapshot(q, (snap) => {
      const ids = snap.docs.map((d) => d.id);
      setChatIds(ids);
    });
    return () => unsub();
  }, [myId]);

  // Ask for Notification permission (non-blocking)
  useEffect(() => {
    try {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    } catch {}
  }, []);

  // For each chat, listen to the latest message
  useEffect(() => {
    if (!myId || chatIds.length === 0) return;
    const unsubs = chatIds.map((cid) => {
      const messagesQ = query(collection(db, "chats", cid, "messages"), orderBy("createdAt", "desc"), limit(1));
      return onSnapshot(messagesQ, (snap) => {
        if (snap.empty) return;
        const docSnap = snap.docs[0];
        const msg: any = { id: docSnap.id, ...docSnap.data() };

        // Skip first snapshot per chat to avoid spamming on initial load
        if (!initializedChatsRef.current.has(cid)) {
          initializedChatsRef.current.add(cid);
          return;
        }

        // Skip self messages
        if (msg.senderId === myId) return;

        // Suppress while on chat page
        if (location.pathname === "/chat") return;

        // Show in-app toast
        const open = () => navigate(`/chat?u=${(msg.senderId as string)}`);
        toast({ title: "New message", description: (msg.text as string) || "You received a new message", action: (
          <button onClick={open} className="underline">Open</button>
        ) as any });

        // Optional browser notification (tab must be open)
        try {
          if ("Notification" in window && Notification.permission === "granted") {
            const n = new Notification("New message", { body: msg.text || "You received a new message" });
            n.onclick = () => {
              window.focus();
              open();
            };
          }
        } catch {}
      });
    });
    return () => { unsubs.forEach((u) => u && u()); };
  }, [myId, chatIds, location.pathname, navigate, toast]);

  return null;
};

export default MessageNotifications;


