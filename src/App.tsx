import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { InfoCard } from './types';
import { fetchInfoCards } from './services/infoCards';
import InfoCardEditor from './components/InfoCardEditor';
import InfoCardList from './components/InfoCardList';
import { Plus, RefreshCw } from 'lucide-react';

function App() {
  const [cards, setCards] = useState<InfoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState<InfoCard | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

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

  return (
    <div className="min-h-screen bg-black">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-gray-900 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">DEICER Info Cards CMS</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              className={`inline-flex items-center px-3 py-1.5 border border-gray-800 text-xs font-medium rounded text-gray-300 bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={refreshing}
            >
              <RefreshCw size={14} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-3 py-1.5 border border-gray-800 text-xs font-medium rounded text-gray-300 bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
            >
              <Plus size={14} className="mr-1" />
              New Card
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center text-gray-400">Loading cards...</div>
        ) : (
          <InfoCardList cards={cards} onEdit={handleEdit} />
        )}
      </main>

      {isEditorOpen && (
        <InfoCardEditor
          card={currentCard}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
        />
      )}
    </div>
  );
}

export default App;