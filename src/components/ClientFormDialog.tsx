import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  notes: string | null;
}

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSuccess: () => void;
  userId: string;
}

const ClientFormDialog = ({ open, onOpenChange, client, onSuccess, userId }: ClientFormDialogProps) => {
  const [name, setName] = useState(client?.name || "");
  const [email, setEmail] = useState(client?.email || "");
  const [phone, setPhone] = useState(client?.phone || "");
  const [company, setCompany] = useState(client?.company || "");
  const [status, setStatus] = useState(client?.status || "active");
  const [notes, setNotes] = useState(client?.notes || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isEditing = !!client;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { name, email: email || null, phone: phone || null, company: company || null, status, notes: notes || null, user_id: userId };

      if (isEditing) {
        const { error } = await supabase.from("clients").update(data).eq("id", client.id);
        if (error) throw error;
        toast({ title: "Client updated successfully" });
      } else {
        const { error } = await supabase.from("clients").insert(data);
        if (error) throw error;
        toast({ title: "Client added successfully" });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{isEditing ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the client's information below." : "Fill in the details for the new client."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update" : "Add Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientFormDialog;
