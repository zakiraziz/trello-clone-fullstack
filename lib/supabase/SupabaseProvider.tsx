"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";
import { Board, Column, Task, User, Comment, Attachment, Label } from "@/types"; // Import your types

type SupabaseContext = {
  supabase: SupabaseClient | null;
  isLoaded: boolean;
  // Add methods for common operations
  fetchBoards: () => Promise<Board[]>;
  fetchBoard: (id: string) => Promise<BoardWithColumns | null>;
  createBoard: (board: Omit<Board, "id" | "created_at" | "updated_at">) => Promise<Board>;
  updateBoard: (id: string, updates: Partial<Board>) => Promise<Board>;
  deleteBoard: (id: string) => Promise<void>;
  // Add similar methods for columns, tasks, etc.
  fetchUserProfile: (userId: string) => Promise<User | null>;
};

const Context = createContext<SupabaseContext>({
  supabase: null,
  isLoaded: false,
  fetchBoards: async () => [],
  fetchBoard: async () => null,
  createBoard: async () => ({}) as Board,
  updateBoard: async () => ({}) as Board,
  deleteBoard: async () => {},
  fetchUserProfile: async () => null,
});

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useSession();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!session) return;
    
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${session.getToken()}`,
          },
        },
      }
    );

    setSupabase(client);
    setIsLoaded(true);

    return () => {
      client.removeAllChannels();
    };
  }, [session]);

  const value = useMemo(() => {
    if (!supabase || !isLoaded) {
      return {
        supabase: null,
        isLoaded: false,
        fetchBoards: async () => [],
        fetchBoard: async () => null,
        createBoard: async () => ({}) as Board,
        updateBoard: async () => ({}) as Board,
        deleteBoard: async () => {},
        fetchUserProfile: async () => null,
      };
    }

    return {
      supabase,
      isLoaded,
      // Implement the methods
      async fetchBoards(): Promise<Board[]> {
        const { data, error } = await supabase
          .from("boards")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        return data || [];
      },

      async fetchBoard(id: string): Promise<BoardWithColumns | null> {
        const { data: boardData, error: boardError } = await supabase
          .from("boards")
          .select("*")
          .eq("id", id)
          .single();
        
        if (boardError) throw boardError;
        if (!boardData) return null;

        const { data: columnsData, error: columnsError } = await supabase
          .from("columns")
          .select("*, tasks(*)")
          .eq("board_id", id)
          .order("sort_order", { ascending: true });
        
        if (columnsError) throw columnsError;

        return {
          ...boardData,
          columns: columnsData || [],
        };
      },

      async createBoard(board: Omit<Board, "id" | "created_at" | "updated_at">): Promise<Board> {
        const { data, error } = await supabase
          .from("boards")
          .insert(board)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },

      async updateBoard(id: string, updates: Partial<Board>): Promise<Board> {
        const { data, error } = await supabase
          .from("boards")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      },

      async deleteBoard(id: string): Promise<void> {
        const { error } = await supabase
          .from("boards")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
      },

      async fetchUserProfile(userId: string): Promise<User | null> {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (error) throw error;
        return data;
      },
    };
  }, [supabase, isLoaded]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};

// Custom hooks for specific operations
export const useBoards = () => {
  const { fetchBoards } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadBoards = async () => {
      try {
        setLoading(true);
        const data = await fetchBoards();
        setBoards(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadBoards();
  }, [fetchBoards]);

  return { boards, loading, error, refresh: () => fetchBoards().then(setBoards) };
};

export const useBoard = (id: string) => {
  const { fetchBoard } = useSupabase();
  const [board, setBoard] = useState<BoardWithColumns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadBoard = async () => {
      try {
        setLoading(true);
        const data = await fetchBoard(id);
        setBoard(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadBoard();
  }, [id, fetchBoard]);

  return { board, loading, error, refresh: () => fetchBoard(id).then(setBoard) };
};
