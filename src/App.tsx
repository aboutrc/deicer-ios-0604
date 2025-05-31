import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { InfoCard } from './types';
import { fetchInfoCards } from './services/infoCards';
import InfoCardEditor from './components/InfoCardEditor';
import InfoCardList from './components/InfoCardList';
import Auth from './components/Auth';
import { LogOut, Plus, RefreshCw } from 'lucide-react';
import { supabase } from './lib/supabase';

function App() {
  const [session, setSession] = useState<any>(null);
  const [cards, setCards] = useState<InfoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState<InfoCard | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (session) {
      loadCards();
    }
  }, [session]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await fetchInfoCards();
      setCards(data);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  };

  const handleCreateNew = () => {
    setCurrentCard(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = (card: InfoCard) => {
    setCurrentCard(card);
    setIsEditorOpen(true);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setCurrentCard(undefined);
  };

  const handleEditorSave = () => {
    loadCards();
    setIsEditorOpen(false);
    setCurrentCard(undefined);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <>
        <Auth onAuthChange={setSession} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-gray-900 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">DEICER Info Cards CMS</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              {session?.user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-3 py-1.5 border border-gray-800 text-xs font-medium rounded text-gray-300 bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
            >
              <LogOut size={14} className="mr-1" />
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditorOpen ? (
          <InfoCardEditor 
            card={currentCard} 
            onSave={handleEditorSave} 
            onCancel={handleEditorClose} 
          />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Manage Info Cards</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus size={16} className="mr-1" />
                  Create New Card
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw size={24} className="animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading cards...</span>
              </div>
            ) : (
              <InfoCardList 
                cards={cards} 
                onEdit={handleEdit} 
                onCardsChange={loadCards}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;