import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { mockMovies, getMoviesByIds } from "@/data/mockMovies";
import { auth, db } from "@/lib/firebase";
import { updateProfile as updateAuthProfile } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ProfileData = {
  name: string;
  age: string;
  location: string;
  bio: string;
  avatar: string;
  gender: string;
};

const defaultProfile: ProfileData = {
  name: "",
  age: "",
  location: "",
  bio: "",
  avatar: "",
  gender: "",
};

const Profile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);

  // Load profile from Firestore; fall back to localStorage and auth displayName
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const user = auth.currentUser;
      if (user) {
        const ref = doc(db, "profiles", user.uid);
        const snap = await getDoc(ref);
        const nameFromAuth = user.displayName || "";
        if (mounted && snap.exists()) {
          const data = { ...defaultProfile, ...(snap.data() as any) } as ProfileData;
          if (!data.name && nameFromAuth) data.name = nameFromAuth;
          setProfile(data);
          return;
        }
      }
      try {
        const stored = localStorage.getItem("cinecrush:profile");
        if (stored && mounted) {
          const parsed = JSON.parse(stored);
          const nameFromAuth = auth.currentUser?.displayName || "";
          const data = { ...defaultProfile, ...parsed } as ProfileData;
          if (!data.name && nameFromAuth) data.name = nameFromAuth;
          setProfile(data);
          return;
        }
      } catch {}
      // Final fallback to auth displayName if nothing else
      if (mounted) {
        const nameFromAuth = auth.currentUser?.displayName || "";
        if (nameFromAuth) setProfile((prev) => ({ ...prev, name: nameFromAuth }));
      }
    };
    run();
    return () => { mounted = false; };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Always persist locally first so users don't lose edits
    try {
      localStorage.setItem("cinecrush:profile", JSON.stringify(profile));
    } catch {}

    try {
      const user = auth.currentUser;
      if (user) {
        const ref = doc(db, "profiles", user.uid);
        // also sync favoriteMovies from localStorage if present
        let favoriteMovies: string[] = [];
        try {
          const fav = JSON.parse(localStorage.getItem("cinecrush:favorites") || "[]");
          if (Array.isArray(fav)) favoriteMovies = fav;
        } catch {}
        // ensure createdAt on first write
        let payload: any = { ...profile, favoriteMovies, updatedAt: serverTimestamp() };
        try {
          const existing = await getDoc(ref);
          if (!existing.exists()) {
            payload.createdAt = serverTimestamp();
          }
        } catch {}
        await setDoc(ref, payload, { merge: true });
        // Keep Auth profile in sync (displayName + photoURL)
        const desiredDisplayName = profile.name || undefined;
        const desiredPhotoURL = profile.avatar || undefined;
        const safePhotoURL = desiredPhotoURL && desiredPhotoURL.length <= 2048 && /^(https?:)\/\//.test(desiredPhotoURL)
          ? desiredPhotoURL
          : undefined; // too long or invalid → don't update Auth photoURL
        if ((desiredDisplayName && user.displayName !== desiredDisplayName) || (safePhotoURL && user.photoURL !== safePhotoURL)) {
          try {
            await updateAuthProfile(user, { displayName: desiredDisplayName, photoURL: safePhotoURL });
          } catch (e) {
            // Ignore invalid photoURL errors; Firestore already has avatar
          }
        }
        toast({ title: "Profile updated", description: "Cloud sync complete." });
        return;
      }
      toast({ title: "Profile saved locally", description: "Changes will sync after you sign in." });
    } catch (err: any) {
      console.error("Profile save failed:", err);
      toast({ title: "Cloud sync failed", description: err?.message || "Saved locally; will retry later.", variant: "destructive" });
    }
  };

  // Load favorite movies from localStorage
  let favoriteMoviesIds: string[] = [];
  try {
    const fav = JSON.parse(localStorage.getItem("cinecrush:favorites") || "[]");
    if (Array.isArray(fav)) favoriteMoviesIds = fav;
  } catch {}
  const favoriteMovies = getMoviesByIds(favoriteMoviesIds);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground mt-2">Update your info so the right cinephiles can find you.</p>
        </div>

        <Card className="card-movie">
          <CardHeader>
            <CardTitle>About You</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatar || "/placeholder.svg"}
                alt="Avatar preview"
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input id="avatar" name="avatar" value={profile.avatar} onChange={handleChange} placeholder="https://…" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" name="name" value={profile.name} onChange={handleChange} placeholder="Your name" />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" value={profile.age} onChange={handleChange} placeholder="e.g. 27" />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={profile.location} onChange={handleChange} placeholder="City, Country" />
            </div>
            <div>
              <Label htmlFor="bio">About</Label>
              <Textarea id="bio" name="bio" value={profile.bio} onChange={handleChange} placeholder="Tell others about your movie taste, favorite directors, etc." rows={5} />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={profile.gender} onValueChange={(value) => setProfile((prev) => ({ ...prev, gender: value }))}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button type="button" className="btn-neon" onClick={handleSave}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-movie">
          <CardHeader>
            <CardTitle>Your Favorite Movies</CardTitle>
          </CardHeader>
          <CardContent>
            {favoriteMovies.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {favoriteMovies.map((movie) => (
                  <div key={movie.id} className="flex-shrink-0">
                    <img src={movie.poster} alt={movie.title} className="w-20 h-28 object-cover rounded-lg" />
                    <div className="text-xs mt-1 w-20 truncate">{movie.title}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>You haven't added any favorites yet.</p>
                <div className="mt-3">
                  <Link to="/discover">
                    <Button variant="outline">Discover Movies</Button>
                  </Link>
                </div>
              </div>
            )}

            {favoriteMovies.length > 0 && (
              <div className="mt-4">
                <Badge>Favorites: {favoriteMovies.length}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;


