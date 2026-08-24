import { FormEvent, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { User } from "../types";

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", course: user?.course || "", year: user?.year || "", studyPreferences: user?.studyPreferences || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await api.put<{ user: User }>("/user/profile", form);
      setUser(res.user);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const deleteData = async () => {
    setDeleting(true);
    try {
      await api.delete("/user/data");
      await logout();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Profile</h1>

      <Card className="mt-6">
        <form onSubmit={save} className="grid gap-4">
          <Input label="Name" maxLength={100} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Email" value={user?.email || ""} disabled className="opacity-60" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Course" maxLength={100} value={form.course} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))} />
            <Input label="Year" maxLength={50} value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} />
          </div>
          <Input
            label="Study preferences"
            maxLength={500}
            placeholder="e.g. morning study sessions, quiet spaces"
            value={form.studyPreferences}
            onChange={(e) => setForm((f) => ({ ...f, studyPreferences: e.target.value }))}
          />
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
            {saved && <span className="text-xs font-medium text-emerald-600">Saved.</span>}
          </div>
        </form>
      </Card>

      <Card className="mt-6">
        <h2 className="font-display font-semibold text-ink">Privacy Settings</h2>
        <p className="mt-1 text-sm text-inkmute">
          Manage what CalmCampus AI stores about you. See our <a href="/privacy" className="font-semibold text-lavender-deep">Privacy page</a> for details.
        </p>

        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/60 p-4">
          <p className="text-sm font-semibold text-red-700">Delete My Data</p>
          <p className="mt-1 text-xs text-red-600">
            This permanently deletes your account, conversations, mood entries, and study tasks. This cannot be undone.
          </p>
          {!confirmDelete ? (
            <Button variant="danger" size="sm" className="mt-3" onClick={() => setConfirmDelete(true)}>
              Delete My Data
            </Button>
          ) : (
            <div className="mt-3 flex gap-3">
              <Button variant="danger" size="sm" disabled={deleting} onClick={deleteData}>
                {deleting ? "Deleting…" : "Yes, permanently delete"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
