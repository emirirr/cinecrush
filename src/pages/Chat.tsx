import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, Send } from "lucide-react";

type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt?: any;
};

function getChatId(a: string, b: string) {
  return [a, b].sort().join("__");
}

const Chat = () => {
  const [params] = useSearchParams();
  const peerId = params.get("u") || "";
  const peerNameParam = params.get("n") || "";
  const peerAvatarParam = params.get("a") || "";
  const [myId, setMyId] = useState<string>(auth.currentUser?.uid || "");
  const chatId = useMemo(() => (myId && peerId ? getChatId(myId, peerId) : ""), [myId, peerId]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [peer, setPeer] = useState<{ name: string; avatar: string } | null>({ name: peerNameParam, avatar: peerAvatarParam });

  // Keep auth user in sync (handles initial null -> user)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setMyId(u?.uid || "");
    });
    return () => unsub();
  }, []);

  // Load peer profile (name, avatar)
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!peerId) return;
      try {
        const snap = await getDoc(doc(db, "profiles", peerId));
        if (active) {
          if (snap.exists()) {
            const d = snap.data() as any;
            setPeer({ name: d?.name || "", avatar: d?.avatar || "" });
          } else {
            setPeer((p) => p || { name: peerNameParam, avatar: peerAvatarParam });
          }
        }
      } catch {
        if (active) setPeer((p) => p || { name: peerNameParam, avatar: peerAvatarParam });
      }
    };
    load();
    return () => { active = false };
  }, [peerId, peerNameParam, peerAvatarParam]);

  useEffect(() => {
    if (!chatId || !myId || !peerId) return;
    // Create/merge chat doc without reading first (avoids permission-denied before members exist)
    const ref = doc(db, "chats", chatId);
    setDoc(ref, { createdAt: serverTimestamp(), members: [myId, peerId] }, { merge: true }).catch(() => {});
  }, [chatId, myId, peerId]);

  useEffect(() => {
    if (!chatId || !myId || !peerId) return;
    let unsub: (() => void) | undefined;
    let cancelled = false;
    const start = async () => {
      // Ensure chat exists before subscribing (in case rules require members)
      try {
        const ref = doc(db, "chats", chatId);
        await setDoc(ref, { createdAt: serverTimestamp(), members: [myId, peerId] }, { merge: true });
      } catch {}
      if (cancelled) return;
      const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
      unsub = onSnapshot(q, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Message[];
        setMessages(list);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
      }, (err) => {
        // Swallow permission errors to avoid unhandled promise rejections
        console.error(err);
      });
    };
    start();
    return () => { cancelled = true; if (unsub) unsub(); };
  }, [chatId, myId, peerId]);

  const ensureChat = async () => {
    if (!chatId || !myId || !peerId) return false;
    const ref = doc(db, "chats", chatId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { createdAt: serverTimestamp(), members: [myId, peerId] }, { merge: true });
    } else {
      const data = snap.data() as any;
      if (!Array.isArray(data?.members) || !data.members.includes(myId) || !data.members.includes(peerId)) {
        await setDoc(ref, { members: [myId, peerId] }, { merge: true });
      }
    }
    return true;
  };

  const send = async () => {
    if (!chatId || !myId || !text.trim()) {
      if (!myId) toast({ title: "Sign in required", description: "Please sign in to send messages.", variant: "destructive" });
      return;
    }
    try {
      await ensureChat();
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: myId,
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (e: any) {
      toast({ title: "Failed to send", description: e?.message || "Please try again.", variant: "destructive" });
    }
  };

  if (!peerId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No conversation selected</h2>
          <p className="text-muted-foreground">Open a match and tap Message.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
        {/* Header - Instagram-like */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
          <div className="px-4 h-14 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={() => navigate(`/user/${peerId}`)} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={peer?.avatar || "/placeholder.svg"} />
                <AvatarFallback>{(peer?.name || "?").slice(0,1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-semibold leading-tight">{peer?.name || "Chat"}</div>
                <div className="text-xs text-muted-foreground leading-none">Tap to view profile</div>
              </div>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 md:py-4 space-y-3 pb-24 md:pb-4">
          {messages.map(m => (
            <div key={m.id} className={`max-w-[75%] px-3 py-2 text-sm leading-relaxed ${m.senderId === myId ? 'ml-auto bg-primary text-primary-foreground rounded-2xl rounded-br-sm' : 'mr-auto bg-muted text-foreground rounded-2xl rounded-bl-sm'}`}>
              {m.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <div className="sticky bottom-0 bg-background/90 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-t pb-[env(safe-area-inset-bottom)]">
          <div className="px-3 md:px-4 py-2 md:py-3 flex items-center gap-2">
            <Input
              placeholder="Message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              className="flex-1 min-w-0 h-12 md:h-11 rounded-full text-base md:text-sm px-4"
            />
            <Button
              onClick={send}
              disabled={!text.trim() || !chatId}
              className="rounded-full h-12 w-12 md:h-10 md:w-10 p-0"
              aria-label="Send"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;


