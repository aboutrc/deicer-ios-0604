import React from 'react';
import { Map, CreditCard, Shield, Scale, Search, RefreshCw, MapPin, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { translations } from '../translations';

interface BottomMenuProps {
  language?: 'en' | 'es' | 'zh' | 'hi' | 'ar';
  onAddMarkClick?: () => void;
  onRefreshClick?: () => void;
  onSearchClick?: () => void;
  onUniversityClick?: () => void;
}

const BottomMenu: React.FC<BottomMenuProps> = ({ 
  language = 'en',
  onAddMarkClick,
  onRefreshClick,
  onSearchClick,
  onUniversityClick
}) => {
  const location = useLocation();
  const t = translations[language];
  
  // Only show map-specific controls on the map page
  const isMapPage = location.pathname === '/';
  
  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-t border-gray-800 bottom-menu">
      <div className="grid grid-cols-4 divide-x divide-gray-800">
        {isMapPage ? (
          <>
            <button
              onClick={onSearchClick}
              className="flex flex-col items-center justify-center py-3 h-full transition-colors hover:bg-gray-900"
            >
              <Search size={20} className="mb-1" />
              <span className="text-xs">
                {language === 'es' ? 'Buscar' : 
                 language === 'zh' ? '搜索' : 
                 language === 'hi' ? 'खोज' : 
                 language === 'ar' ? 'بحث' : 
                 'Search'}
              </span>
            </button>
            
            <button
              onClick={onUniversityClick}
              className="flex flex-col items-center justify-center py-3 h-full transition-colors hover:bg-gray-900"
            >
              <MapPin size={20} className="mb-1" />
              <span className="text-xs">
                {language === 'es' ? 'Universidad' : 
                 language === 'zh' ? '大学' : 
                 language === 'hi' ? 'विश्वविद्यालय' : 
                 language === 'ar' ? 'جامعة' : 
                 'University'}
              </span>
            </button>
            
            <button
              onClick={onAddMarkClick}
              className="flex flex-col items-center justify-center py-3 h-full transition-colors hover:bg-gray-900"
            >
              <Plus size={20} className="mb-1" />
              <span className="text-xs">
                {language === 'es' ? 'Añadir Marca' : 
                 language === 'zh' ? '添加标记' : 
                 language === 'hi' ? 'मार्कर जोड़ें' : 
                 language === 'ar' ? 'إضافة علامة' : 
                 'Add Marker'}
              </span>
            </button>
            
            <button
              onClick={onRefreshClick}
              className="flex flex-col items-center justify-center py-3 h-full transition-colors hover:bg-gray-900"
            >
              <RefreshCw size={20} className="mb-1" />
              <span className="text-xs">
                {language === 'es' ? 'Actualizar' : 
                 language === 'zh' ? '刷新' : 
                 language === 'hi' ? 'रिफ्रेश' : 
                 language === 'ar' ? 'تحديث' : 
                 'Refresh'}
              </span>
            </button>
          </>
        ) : (
          // Show regular navigation on non-map pages
          <>
            <Link
              to="/"
              className="flex flex-col items-center justify-center py-3 h-full transition-colors hover:bg-gray-900"
            >
              <Map size={20} className="mb-1" />
              <span className="text-xs">
                {language === 'es' ? 'Mapa' : 
                 language === 'zh' ? '地图' : 
                 language === 'hi' ? 'मानचित्र' : 
                 language === 'ar' ? 'خريطة' : 
                 'Map'}
              </span>
            </Link>
            
            <Link
              to="/card"
              className="flex flex-col items-center justify-center py-3 h-full transition-colors hover:bg-gray-900"
            >
              <CreditCard size={20} className="mb-1" />
              <span className="text-xs">
                {language === 'es' ? 'Tarjeta' : 
                 language === 'zh' ? '卡片' : 
                 language === 'hi' ? 'कार्ड' : 
                 language === 'ar' ? 'بطاقة' : 
                 'Card'}
              </span>
            </Link>
            
            <Link
              to="/protect"
              className="flex flex-col items-center justify-center py-3 h-full transition-colors hover:bg-gray-900"
            >
              <Shield size={20} className="mb-1" />
              <span className="text-xs">
                {language === 'es' ? 'Proteger' : 
                 language === 'zh' ? '保护' : 
                 language === 'hi' ? 'सुरक्षा' : 
                 language === 'ar' ? 'حماية' : 
                 'Protect'}
              </span>
            </Link>
            
            <Link
              to="/info"
              className="flex flex-col items-center justify-center py-3 h-full transition-colors hover:bg-gray-900"
            >
              <Scale size={20} className="mb-1" />
              <span className="text-xs">
                {language === 'es' ? 'Info' : 
                 language === 'zh' ? '信息' : 
                 language === 'hi' ? 'जानकारी' : 
                 language === 'ar' ? 'معلومات' : 
                 'Info'}
              </span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default BottomMenu;