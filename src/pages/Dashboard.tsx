import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import ClientFormDialog from "@/components/ClientFormDialog";
import { Users, Plus, Search, LogOut, Pencil, Trash2, Building2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const statusColors: Record<string, string> = {
  active: "bg-success/15 text-success border-success/30",
  inactive: "bg-muted text-muted-foreground border-border",
  lead: "bg-accent/15 text-accent border-accent/30",
};

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchClients = useCallback(async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading clients", description: error.message, variant: "destructive" });
    } else {
      setClients(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchClients();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, fetchClients]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("clients").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Client deleted" });
      fetchClients();
    }
    setDeleteId(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const filtered = clients.filter((c) =>
    [c.name, c.email, c.company, c.phone].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">ClientVault</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Clients", value: clients.length, icon: Users },
            { label: "Active", value: clients.filter((c) => c.status === "active").length, icon: Building2 },
            { label: "Leads", value: clients.filter((c) => c.status === "lead").length, icon: Plus },
          ].map((stat) => (
            <Card key={stat.label} className="border-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10">
                  <stat.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => { setEditingClient(null); setFormOpen(true); }}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Client
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden lg:table-cell">Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {search ? "No clients match your search." : "No clients yet. Add your first client!"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((client) => (
                  <TableRow key={client.id} className="group">
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{client.email || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{client.phone || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{client.company || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[client.status]}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingClient(client); setFormOpen(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(client.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </main>

      {/* Dialogs */}
      <ClientFormDialog
        key={editingClient?.id || "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editingClient}
        onSuccess={fetchClients}
        userId={user.id}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this client?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
