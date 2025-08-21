import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PublicUser = {
  id: string;
  name: string;
  age?: string | number;
  bio?: string;
  avatar?: string;
  location?: string;
  favoriteMovies?: string[];
  gender?: string;
};

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "profiles", id));
        if (snap.exists() && mounted) {
          const data = snap.data() as any;
          setUser({
            id,
            name: data?.name || "",
            age: data?.age,
            bio: data?.bio || "",
            avatar: data?.avatar || "",
            location: data?.location || "",
            favoriteMovies: Array.isArray(data?.favoriteMovies) ? data.favoriteMovies : [],
            gender: data?.gender || "",
          });
        } else if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎥</div>
          <h2 className="text-2xl font-bold mb-2">Loading profile…</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="card-movie">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground text-sm">{user.age ? `${user.age} • ` : ""}{user.location}</p>
                {user.gender && <Badge className="mt-2">{user.gender}</Badge>}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="font-semibold mb-2">About</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{user.bio}</p>
            </div>

            <div className="mt-6 flex gap-2">
              <Button className="btn-neon" onClick={() => navigate(`/chat?u=${user.id}&n=${encodeURIComponent(user.name || '')}&a=${encodeURIComponent(user.avatar || '')}`)}>Send Message</Button>
              <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;


