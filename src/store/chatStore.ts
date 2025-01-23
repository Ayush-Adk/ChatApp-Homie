import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'];
type Chat = Database['public']['Tables']['chats']['Row'];

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  sendMessage: (content: string, type: string) => Promise<void>;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  createChat: (userIds: string[], name?: string) => Promise<void>;
  setCurrentChat: (chat: Chat) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  sendMessage: async (content, type = 'text') => {
    const { currentChat } = get();
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!currentChat || !user) return;

    const message = {
      chat_id: currentChat.id,
      sender_id: user.id,
      content,
      type,
      read_by: [user.id],
    };

    const { error } = await supabase.from('messages').insert(message);
    if (error) throw error;
  },
  loadChats: async () => {
    set({ loading: true });
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) return;

    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    set({ chats, loading: false });
  },
  loadMessages: async (chatId: string) => {
    set({ loading: true });
    
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    set({ messages, loading: false });
  },
  createChat: async (userIds: string[], name?: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({
        type: userIds.length > 1 ? 'group' : 'direct',
        name,
      })
      .select()
      .single();

    if (chatError || !chat) throw chatError;

    const participants = [...userIds, user.id].map(userId => ({
      chat_id: chat.id,
      user_id: userId,
    }));

    const { error: participantError } = await supabase
      .from('chat_participants')
      .insert(participants);

    if (participantError) throw participantError;

    await get().loadChats();
  },
  setCurrentChat: (chat) => set({ currentChat: chat }),
}));