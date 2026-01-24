import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Settings, Save, Trash2, AlertTriangle, Users, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Club {
    id: string;
    name: string;
    description: string | null;
    category: string;
    city_id: string | null;
}

interface City {
    id: string;
    name: string;
    country: string;
}

const ClubSettings = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { toast } = useToast();

    const [club, setClub] = useState<Club | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        city_id: "",
    });

    useEffect(() => {
        if (id) {
            fetchClub();
            fetchCities();
        }
    }, [id]);

    const fetchClub = async () => {
        const { data, error } = await supabase
            .from("clubs")
            .select("*")
            .eq("id", id)
            .single();

        if (!error && data) {
            setClub(data);
            setFormData({
                name: data.name,
                description: data.description || "",
                category: data.category,
                city_id: data.city_id || "",
            });
        }
        setLoading(false);
    };

    const fetchCities = async () => {
        const { data } = await supabase
            .from("cities")
            .select("*")
            .order("name");
        if (data) setCities(data);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const { error } = await supabase
            .from("clubs")
            .update({
                name: formData.name,
                description: formData.description,
                category: formData.category,
                city_id: formData.city_id || null,
            })
            .eq("id", id);

        setSaving(false);

        if (error) {
            toast({
                title: "Update Failed",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Settings Saved",
                description: "Club information updated successfully",
            });
            fetchClub();
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this club? This action cannot be undone.")) {
            return;
        }

        const { error } = await supabase.from("clubs").delete().eq("id", id);

        if (error) {
            toast({
                title: "Delete Failed",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Club Deleted",
                description: "Club has been permanently removed",
            });
            navigate("/clubs");
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-white/5 rounded w-1/4"></div>
                    <div className="h-64 bg-white/5 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-display mb-2">CONFIGURATION</h1>
                <p className="text-white/50 font-mono text-sm">
                    &gt;&gt; ADMIN ONLY // CLUB SETTINGS
                </p>
            </div>

            {/* Settings Form */}
            <form onSubmit={handleSave} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                    <h2 className="font-display text-xl flex items-center gap-3">
                        <Settings className="w-5 h-5 text-cyan-400" />
                        Basic Information
                    </h2>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-white/40 mb-3 font-mono">
                            Club Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-white/40 mb-3 font-mono">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-3 font-mono">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({ ...formData, category: e.target.value })
                                }
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                                required
                            >
                                <option value="tech">Technology</option>
                                <option value="sports">Sports</option>
                                <option value="arts">Arts</option>
                                <option value="music">Music</option>
                                <option value="education">Education</option>
                                <option value="community">Community</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-3 font-mono">
                                City
                            </label>
                            <select
                                value={formData.city_id}
                                onChange={(e) =>
                                    setFormData({ ...formData, city_id: e.target.value })
                                }
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500/50 transition-colors"
                            >
                                <option value="">Select City</option>
                                {cities.map((city) => (
                                    <option key={city.id} value={city.id}>
                                        {city.name}, {city.country}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg px-6 py-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <div className="flex items-center justify-center gap-3">
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-mono uppercase tracking-wider text-cyan-400">
                                    Saving...
                                </span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 text-cyan-400" />
                                <span className="text-sm font-mono uppercase tracking-wider text-cyan-400">
                                    Save Changes
                                </span>
                            </>
                        )}
                    </div>
                </button>
            </form>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h2 className="font-display text-xl text-red-400">Danger Zone</h2>
                </div>

                <p className="text-white/60 text-sm font-mono leading-relaxed">
                    Deleting this club will permanently remove all associated data including
                    events, members, and participation records. This action cannot be undone.
                </p>

                <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg px-6 py-4 transition-all duration-300 group"
                >
                    <div className="flex items-center justify-center gap-3">
                        <Trash2 className="w-5 h-5 text-red-400" />
                        <span className="text-sm font-mono uppercase tracking-wider text-red-400">
                            Delete Club
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default ClubSettings;
