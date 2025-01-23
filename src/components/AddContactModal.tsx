import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useChatStore } from '../store/chatStore';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddContactModal({ isOpen, onClose }: AddContactModalProps) {
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const { createChat } = useChatStore();

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url')
        .eq('email', searchEmail.trim())
        .single();

      if (error) throw error;
      setSearchResult(data);
    } catch (error: any) {
      toast.error('User not found');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!searchResult) return;

    try {
      await createChat([searchResult.id]);
      toast.success('Chat created successfully');
      onClose();
    } catch (error: any) {
      toast.error('Failed to create chat');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Contact</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="email"
                placeholder="Search by email address"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {searchResult && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  {searchResult.avatar_url ? (
                    <img
                      src={searchResult.avatar_url}
                      alt={searchResult.full_name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <span className="text-xl font-semibold text-indigo-600">
                      {searchResult.full_name[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{searchResult.full_name}</h4>
                  <p className="text-sm text-gray-500">{searchResult.email}</p>
                </div>
                <button
                  onClick={handleAddContact}
                  className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}