import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { supabase } from '../lib/supabase';
import { ChevronDown, ChevronRight, Pencil, Plus, Save, Trash2, GripVertical, Link as LinkIcon, Image } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface InfoEditorProps {
  language?: 'en' | 'es' | 'zh' | 'hi' | 'ar';
}

interface InfoCard {
  id: string;
  title: string;
  content: string;
  video_url?: string;
  image_url?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

const InfoEditor: React.FC<InfoEditorProps> = ({ language = 'en' }) => {
  const [cards, setCards] = useState<InfoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<InfoCard | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCard, setNewCard] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [reordering, setReordering] = useState(false);
  const [translating, setTranslating] = useState(false);

  const fetchCards = async () => {
    try {
      console.log('Fetching info cards...');
      const { data, error: fetchError } = await supabase
        .from('info_cards')
        .select('*')
        .order('order_index', { ascending: true });

      console.log('Fetch response:', { data, error: fetchError });

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      setCards(data || []);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const startEditing = async (card: InfoCard) => {
    try {
      // Verify the card still exists before editing
      const { data: existingCard, error: checkError } = await supabase
        .from('info_cards')
        .select('*')
        .eq('id', card.id)
        .single();

      if (checkError) {
        throw checkError;
      }

      if (!existingCard) {
        console.error('Card no longer exists:', card.id);
        setError('This card no longer exists. It may have been deleted.');
        // Remove the non-existent card from the local state
        setCards(currentCards => currentCards.filter(c => c.id !== card.id));
        return;
      }

      setEditingCard(existingCard);
      setCurrentTitle(existingCard.title);
      setCurrentContent(existingCard.content);
      setCurrentImageUrl(existingCard.image_url || '');
      setCurrentVideoUrl(existingCard.video_url || '');
      setNewCard(false);
      setError(null);
    } catch (err) {
      console.error('Error starting edit:', err);
      setError('Failed to load card for editing');
    }
  };

  const startNewCard = () => {
    setNewCard(true);
    setEditingCard(null);
    setCurrentTitle('');
    setCurrentContent('');
    setCurrentImageUrl('');
    setCurrentVideoUrl('');
    setError(null);
  };

  const cancelEditing = () => {
    setEditingCard(null);
    setNewCard(false);
    setCurrentTitle('');
    setCurrentContent('');
    setCurrentImageUrl('');
    setCurrentVideoUrl('');
  };

  const validatePost = () => {
    if (!currentTitle.trim()) {
      throw new Error('Title is required');
    }

    if (currentTitle.length > 200) {
      throw new Error('Title must be less than 200 characters');
    }

    if (!currentContent.trim()) {
      throw new Error('Content cannot be empty');
    }

    if (currentContent.length > 10000) {
      throw new Error('Content must be less than 10000 characters');
    }

    return currentContent;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const content = validatePost();

      if (editingCard) {
        const { data: updatedCard, error: updateError } = await supabase
          .from('info_cards')
          .update({
            title: currentTitle,
            content: currentContent,
            image_url: currentImageUrl,
            video_url: currentVideoUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCard.id)
          .select()
          .single();

        if (updateError || !updatedCard) {
          console.error('Update error:', updateError);
          throw new Error(`Failed to update card: ${updateError?.message}`);
        }

        setCards(currentCards => 
          currentCards.map(c => 
            c.id === editingCard.id ? updatedCard : c
          )
        );

        cancelEditing();
      } else {
        // Create new card
        const { data: newCard, error: createError } = await supabase
          .from('info_cards')
          .insert({
            title: currentTitle,
            content: currentContent,
            image_url: currentImageUrl,
            video_url: currentVideoUrl,
            order_index: cards.length,
            is_active: true
          })
          .select()
          .single();

        if (createError || !newCard) {
          console.error('Create error:', createError);
          throw new Error(`Failed to create card: ${createError?.message}`);
        }

        setCards(currentCards => [...currentCards, newCard]);
        cancelEditing();
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  const handleTranslate = async () => {
    try {
      setTranslating(true);
      setError(null);
      
      // Get all cards that need translation
      const cardsToTranslate = cards.map(card => ({
        id: card.id,
        title: card.title,
        content: card.content
      }));

      // Call the translation function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ posts: cardsToTranslate })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Translation failed');
      }

      // Refresh cards after translation
      await fetchCards();
      setTranslating(false);
      setError(null);
    } catch (err) {
      console.error('Error translating cards:', err);
      setError(err instanceof Error ? err.message : 'Failed to translate cards');
      setTranslating(false);
    }
  };

  const handleDelete = async (cardId: string) => {
    try {
      setError(null);
      
      // Confirm before deleting
      if (!window.confirm('Are you sure you want to delete this card?')) {
        return;
      }
      
      const { error: deleteError } = await supabase
        .from('info_cards')
        .delete()
        .eq('id', cardId);

      if (deleteError) throw deleteError;
      
      // Remove from expanded cards set
      setExpandedCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });
      
      // Update local state without refetching
      setCards(currentCards => currentCards.filter(c => c.id !== cardId));
    } catch (err) {
      console.error('Error deleting card:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete card');
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    setError(null);

    try {
      const items = Array.from(cards);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      // First update local state for immediate feedback
      const updatedCards = items.map((card, index) => ({
        ...card,
        order_index: index 
      }));
      setCards(updatedCards);

      // Then update the database
      const { error } = await supabase
        .from('info_cards')
        .upsert(
          updatedCards.map(card => ({
            id: card.id,
            order_index: card.order_index,
            updated_at: new Date().toISOString()
          }))
        );

      if (error) throw error;
    } catch (err) {
      console.error('Error updating card order:', err);
      setError('Failed to update card order');
      // Revert to original order on error
      await fetchCards();
    }
  };

  return (
    <div className={`min-h-screen bg-gray-900 p-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Card Editor</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={startNewCard}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              <span>New Card</span>
            </button>
            <button
              onClick={handleTranslate}
              disabled={translating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <span>{translating ? 'Translating...' : 'Translate All'}</span>
            </button>
            <button
              onClick={() => setReordering(!reordering)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                reordering 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              <GripVertical size={20} />
              <span>{reordering ? 'Done Reordering' : 'Reorder Cards'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
          
        {(editingCard || newCard) && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="space-y-4">
              <input
                type="text"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                placeholder="Card title..."
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={200}
              />
              <div className="bg-gray-700 rounded-lg overflow-hidden">
                <Editor
                  apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                  value={currentContent}
                  onEditorChange={(content) => setCurrentContent(content)}
                  init={{
                    height: 400,
                    menubar: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'link'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                      'bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                     'removeformat | link image | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; color: #e5e7eb; }',
                    skin: 'oxide-dark',
                    content_css: 'dark',
                    link_default_target: '_blank',
                    link_assume_external_targets: true,
                    link_title: false,
                    link_context_toolbar: true,
                    link_rel_list: [
                      { title: 'None', value: '' },
                      { title: 'No follow', value: 'nofollow' },
                      { title: 'No opener', value: 'noopener' },
                      { title: 'No referrer', value: 'noreferrer' }
                    ],
                    link_target_list: [
                      { title: 'New window', value: '_blank' },
                      { title: 'Same window', value: '_self' }
                    ],
                    images_upload_handler: async function (blobInfo, progress) {
                      try {
                        const file = blobInfo.blob();
                        const fileName = `${Date.now()}-${blobInfo.filename()}`;
                        
                        // Upload to info-card-images bucket
                        const { data, error } = await supabase.storage
                          .from('info-card-images')
                          .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false
                          });
                        
                        if (error) throw error;
                        
                        // Get public URL
                        const { data: { publicUrl } } = supabase.storage
                          .from('info-card-images')
                          .getPublicUrl(fileName);
                        
                        return publicUrl;
                      } catch (error) {
                        console.error('Image upload error:', error);
                        return Promise.reject('Image upload failed');
                      }
                    },
                    image_dimensions: false,
                    image_class_list: [
                      { title: 'None', value: '' },
                      { title: 'Responsive', value: 'img-fluid rounded' }
                    ],
                    file_picker_types: 'image',
                    automatic_uploads: true
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={20} />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-gray-400 text-center">Loading cards...</div>
        ) : !editingCard && !newCard && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="cards">
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {cards.map((card, index) => (
                    <Draggable
                      key={card.id}
                      draggableId={card.id}
                      index={index}
                      isDragDisabled={!reordering}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-gray-800 rounded-lg overflow-hidden ${
                            snapshot.isDragging ? 'ring-2 ring-blue-500 shadow-lg' : ''
                          }`}
                        >
                          <div className="px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center flex-1">
                              {reordering && (
                                <div
                                  {...provided.dragHandleProps}
                                  className="mr-4 p-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-300 rounded"
                                >
                                  <GripVertical size={20} />
                                </div>
                              )}
                              <button
                                onClick={() => toggleCard(card.id)}
                                className="flex-1 flex items-center justify-between text-white hover:text-gray-300"
                              >
                                <h2 className="text-xl font-semibold">
                                  {card.title}
                                </h2>
                                {expandedCards.has(card.id) ? (
                                  <ChevronDown size={20} />
                                ) : (
                                  <ChevronRight size={20} />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => startEditing(card)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                              >
                                
                                <Pencil size={20} />
                              </button>
                              <button
                                onClick={() => handleDelete(card.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-lg"
                                aria-label="Delete card"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>

                          {expandedCards.has(card.id) && (
                            <div className="px-6 pb-6">
                              <div 
                                className="text-gray-300 prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ 
                                  __html: card.content
                                }}
                              />
                              {card.created_at && (
                                <div className="mt-4 text-gray-500 text-sm">
                                  Created: {new Date(card.created_at).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default InfoEditor;