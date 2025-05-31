import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { InfoCard } from '../types';
import { deleteInfoCard, reorderInfoCards } from '../services/infoCards';
import { Edit, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface InfoCardListProps {
  cards: InfoCard[];
  onEdit: (card: InfoCard) => void;
  onCardsChange: () => void;
}

const InfoCardList: React.FC<InfoCardListProps> = ({ cards, onEdit, onCardsChange }) => {
  const [isReordering, setIsReordering] = useState(false);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this card?')) {
      return;
    }
    
    try {
      // Remove from local state first for immediate UI feedback
      const updatedCards = cards.filter(card => card.id !== id);
      onCardsChange();
      
      // Then attempt the delete
      await deleteInfoCard(id);
      
      // Force a refresh to ensure we have the latest state
      onCardsChange();
      toast.success('Card deleted successfully');
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete card');
      // Refresh to ensure UI is in sync with server state
      onCardsChange();
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    // Create a new array from the cards to avoid mutating state
    const items = [...cards];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setIsReordering(true);
    
    try {
      // Update the local state immediately for better UX
      onCardsChange();
      
      // Then perform the server update
      await reorderInfoCards(items);
      
      // Refresh the list to ensure we have the latest state
      onCardsChange();
      toast.success('Cards reordered successfully');
    } catch (error) {
      console.error('Error reordering cards:', error);
      toast.error('Failed to reorder cards');
      // Refresh to ensure UI is in sync with server state
      onCardsChange();
    } finally {
      setIsReordering(false);
    }
  };

  // Function to safely truncate HTML content
  const truncateHtml = (html: string, maxLength: number = 150) => {
    // Simple way to strip HTML tags and truncate
    // First remove any <p> tags at the start and end
    const cleanHtml = html
      .replace(/<\/?p>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
    
    if (cleanHtml.length <= maxLength) {
      return cleanHtml;
    }
    
    // Create a temporary div to handle HTML entities properly
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHtml;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-black rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-900">
        <h3 className="text-lg font-medium text-white">Info Cards ({cards.length})</h3>
        <p className="text-sm text-gray-400">Drag and drop to reorder</p>
      </div>
      
      {cards.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-400">
          No info cards found. Create your first one!
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="cards">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="divide-y divide-gray-900"
              >
                {cards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center p-4 hover:bg-gray-900 ${!card.is_active ? 'bg-gray-900' : ''}`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="mr-3 text-gray-400 cursor-grab"
                        >
                          <GripVertical size={20} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h4 className="text-sm font-medium text-white truncate">{card.title}</h4>
                            {!card.is_active && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-900 text-gray-400">
                                <EyeOff size={12} className="mr-1" />
                                Inactive
                              </span>
                            )}
                            {card.is_active && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300">
                                <Eye size={12} className="mr-1" />
                                Active
                              </span>
                            )}
                          </div>
                          <div 
                            className="mt-1 text-sm text-gray-300 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: truncateHtml(card.content) }}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Order: {card.order_index} | Last updated: {new Date(card.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="ml-4 flex-shrink-0 flex">
                          <button
                            onClick={() => onEdit(card)}
                            className="mr-2 p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(card.id)}
                            className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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
      
      {isReordering && (
        <div className="p-4 bg-blue-50 text-blue-700 text-sm flex items-center justify-center">
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          Saving new order...
        </div>
      )}
    </div>
  );
};

// Add this component to prevent "Loader2 is not defined" error
const Loader2 = (props: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default InfoCardList;