"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/auth";

/**
 * Foundation hook — returns the current auth user + profile.
 * Full auth feature will extend this with mutations & redirects.
 */
export function useCurrentUser() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (mounted) {
        setProfile(data);
        setLoading(false);
      }
    }

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { profile, loading };
}
