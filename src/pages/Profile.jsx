import { useEffect, useState } from "react";
import PublicLayout from "../components/PublicLayout";
import { FiUser } from "react-icons/fi";
import { supabase } from "../supabaseClient";

export default function Profile() {
  const [memberSession, setMemberSession] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem("pydc_member_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setMemberSession(parsed);

        if (parsed.isMember && parsed.email) {
          const fetchProfileImage = async () => {
            const { data, error } = await supabase
              .from("member_credentials")
              .select("image_url")
              .eq("email", parsed.email)
              .maybeSingle();
            if (!error && data?.image_url) {
              setProfileImage(data.image_url);
            }
          };
          fetchProfileImage();
        }
      } catch (err) {
        console.warn("Invalid member session stored", err);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex-1 min-h-screen flex items-center justify-center">
          <span className="text-sm text-slate-500">Loading profile…</span>
        </div>
      </PublicLayout>
    );
  }

  const session = memberSession || {
    name: "Guest User",
    email: "guest@helpinghands.org",
    role: "Guest Visitor",
    phone: "+91 0000000000",
    membershipId: "N/A",
    isMember: false,
  };

  return (
    <PublicLayout>
      <div className="flex-1 max-w-xl mx-auto px-6 md:px-10 py-12 w-full">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 space-y-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-24 h-24 rounded-full bg-blue-50 border border-blue-200 overflow-hidden shadow-sm flex items-center justify-center">
              {profileImage && session.isMember ? (
                <img src={profileImage} alt="Member" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-600">
                  <FiUser className="text-3xl" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {session.isMember ? "Club Member Profile" : "Guest Profile"}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {session.isMember
                  ? "Logged in club member account details."
                  : "You are viewing a guest profile. Log in to see club member details."}
              </p>
            </div>
          </div>

          <div className="grid gap-4 text-sm text-slate-600">
            <div className="rounded-3xl border border-slate-100 p-4 bg-slate-50">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 font-bold mb-2">Name</p>
              <p className="font-semibold text-slate-800">{session.name}</p>
            </div>

            <div className="rounded-3xl border border-slate-100 p-4 bg-slate-50">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 font-bold mb-2">Email</p>
              <p className="font-semibold text-slate-800">{session.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-slate-100 p-4 bg-slate-50">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 font-bold mb-2">Role</p>
                <p className="font-semibold text-slate-800">{session.role}</p>
              </div>
              <div className="rounded-3xl border border-slate-100 p-4 bg-slate-50">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 font-bold mb-2">Phone</p>
                <p className="font-semibold text-slate-800">{session.phone}</p>
              </div>
            </div>

            {session.isMember && (
              <div className="rounded-3xl border border-slate-100 p-4 bg-slate-50">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 font-bold mb-2">Membership ID</p>
                <p className="font-semibold text-slate-800">{session.membershipId}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-slate-500 text-sm">
            {session.isMember ? (
              <p>Club members can access their member dashboard and request equipment.</p>
            ) : (
              <p>Guest users can browse the site. Please log in to see full member profile details.</p>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
