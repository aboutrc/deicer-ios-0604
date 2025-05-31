import React, { useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { InfoCard, InfoCardInput } from '../types';
import { createInfoCard, updateInfoCard } from '../services/infoCards';
import { Loader2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface InfoCardEditorProps {
  card?: InfoCard;
  onSave: () => void;
  onCancel: () => void;
}

const InfoCardEditor: React.FC<InfoCardEditorProps> = ({ card, onSave, onCancel }) => {
  const [title, setTitle] = useState(card?.title || '');
  const [content, setContent] = useState(card?.content || '');
  const [imageUrl, setImageUrl] = useState(card?.image_url || '');
  const [videoUrl, setVideoUrl] = useState(card?.video_url || '');
  const [isActive, setIsActive] = useState(card?.is_active ?? true);
  const [isSaving, setIsSaving] = useState(false);
  
  const editorRef = useRef<any>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    // Ensure we have the latest content from the editor
    const editorContent = editorRef.current?.getContent() || content;
    
    setIsSaving(true);
    
    try {
      const cardData: InfoCardInput = {
        title,
        content: editorContent,
        image_url: imageUrl || undefined,
        video_url: videoUrl || undefined,
        is_active: isActive,
      };

      if (card) {
        await updateInfoCard(card.id, cardData);
        toast.success('Card updated successfully');
      } else {
        await createInfoCard(cardData);
        toast.success('Card created successfully');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving card:', error);
      toast.error('Failed to save card');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-black rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          {card ? 'Edit Info Card' : 'Create New Info Card'}
        </h2>
        <button 
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-gray-900"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-800 rounded-md shadow-sm bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-gray-700 focus:border-gray-700"
            placeholder="Enter card title"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
            Content
          </label>
          <Editor
            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
            onInit={(evt, editor) => editorRef.current = editor}
            initialValue={content}
            onEditorChange={setContent}
            init={{
              height: 400,
              menubar: true,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | blocks | ' +
                'bold italic forecolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | link media | help',
              content_style: 'body { font-family:Inter,Arial,sans-serif; font-size:16px }',
              branding: false,
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Featured Image URL (optional)
            </label>
            <input
              id="imageUrl"
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && (
              <div className="mt-2">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="h-20 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Video URL (optional)
            </label>
            <input
              id="videoUrl"
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active (visible to users)
          </label>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 mr-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="-ml-1 mr-2 h-4 w-4" />
                Save Card
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoCardEditor;