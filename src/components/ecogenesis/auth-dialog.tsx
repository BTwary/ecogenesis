"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "./session";
import { api } from "@/lib/client";
import { toast } from "@/hooks/use-toast";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";

const ACCOUNT_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "household", label: "Household" },
  { value: "school", label: "Educational institution" },
  { value: "business", label: "Business" },
  { value: "ngo", label: "Environmental organisation" },
  { value: "community", label: "Community administrator" },
];

export function AuthDialog() {
  const { authOpen, setAuthOpen, user, refresh } = useSession();
  const [busy, setBusy] = useState(false);

  async function onRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: fd.get("email"),
          password: fd.get("password"),
          name: fd.get("name"),
          accountType: fd.get("accountType"),
        }),
      });
      await refresh();
      toast({ title: "Account created", description: "Everything you tracked as a guest has been kept." });
      setAuthOpen(false);
    } catch (err) {
      toast({ title: "Registration failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
      });
      await refresh();
      toast({ title: "Welcome back" });
      setAuthOpen(false);
    } catch (err) {
      toast({ title: "Login failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await api("/api/auth/logout", { method: "POST" });
    await refresh();
    setAuthOpen(false);
    toast({ title: "Signed out", description: "A fresh guest session will be created on your next action." });
  }

  return (
    <Dialog open={authOpen} onOpenChange={setAuthOpen}>
      <DialogContent className="glass-strong sm:max-w-md">
        {user && !user.isAnonymous ? (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-primary" /> Account
              </DialogTitle>
              <DialogDescription>
                {user.name} · {user.email} · {ACCOUNT_TYPES.find((t) => t.value === user.accountType)?.label ?? user.accountType}
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-xl border border-border/70 bg-background/50 p-3 text-xs text-muted-foreground">
              Your guest session was upgraded to a full account, so every calculation, goal, log and project participation
              stays in one continuous history.
            </div>
            <Button variant="outline" className="w-full" onClick={onLogout} disabled={busy}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="register">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Your ECOGENESIS session
              </DialogTitle>
              <DialogDescription>
                You are currently exploring as a guest — everything already works. Create an account to keep your history
                across devices.
              </DialogDescription>
            </DialogHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register">Create account</TabsTrigger>
              <TabsTrigger value="login">Sign in</TabsTrigger>
            </TabsList>
            <TabsContent value="register">
              <form className="space-y-3 pt-2" onSubmit={onRegister}>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name">Name</Label>
                  <Input id="reg-name" name="name" placeholder="Your name or organisation" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" name="email" type="email" required placeholder="you@example.org" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input id="reg-password" name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-type">Account type</Label>
                  <Select name="accountType" defaultValue="individual">
                    <SelectTrigger id="reg-type" className="w-full">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Creating..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="login">
              <form className="space-y-3 pt-2" onSubmit={onLogin}>
                <div className="space-y-1.5">
                  <Label htmlFor="log-email">Email</Label>
                  <Input id="log-email" name="email" type="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="log-password">Password</Label>
                  <Input id="log-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
