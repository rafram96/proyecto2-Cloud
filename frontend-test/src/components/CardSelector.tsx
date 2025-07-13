import React from 'react';
import type { SavedCard } from '../services/cardsService';

interface CardSelectorProps {
  savedCards: SavedCard[];
  selectedCard: SavedCard | null;
  onSelectCard: (card: SavedCard) => void;
  onAddNewCard: () => void;
}

const CardSelector: React.FC<CardSelectorProps> = ({
  savedCards,
  selectedCard,
  onSelectCard,
  onAddNewCard
}) => {
  const getCardIcon = (cardType: SavedCard['cardType']) => {
    const icons: Record<string, string> = {
      visa: '💳',
      mastercard: '💳', 
      amex: '💳',
      discover: '💳'
    };
    return icons[cardType];
  };

  const getCardColor = (cardType: SavedCard['cardType']) => {
    const colors: Record<string, string> = {
      visa: 'bg-blue-100 dark:bg-blue-900',
      mastercard: 'bg-red-100 dark:bg-red-900',
      amex: 'bg-green-100 dark:bg-green-900',
      discover: 'bg-orange-100 dark:bg-orange-900'
    };
    return colors[cardType];
  };

  return (
    <div className="space-y-3">
      <h4 className="text-lg font-lato font-semibold text-gray-800 dark:text-white">
        Seleccionar Tarjeta
      </h4>
      
      {/* Tarjetas guardadas */}
      <div className="space-y-2">
        {savedCards.map((card) => (
          <div
            key={card.id}
            onClick={() => onSelectCard(card)}
            className={`
              p-3 border-2 rounded-lg cursor-pointer transition-all duration-200
              ${selectedCard?.id === card.id
                ? 'border-dorado2 bg-dorado4 bg-opacity-10'
                : 'border-gray-200 dark:border-gray-600 hover:border-dorado3'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getCardColor(card.cardType)}`}>
                  <span className="text-xl">{getCardIcon(card.cardType)}</span>
                </div>
                <div>
                  <p className="font-lato font-medium text-gray-800 dark:text-white">
                    {card.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {card.cardNumber} • {card.expiryDate}
                  </p>
                  {card.isDefault && (
                    <span className="text-xs bg-dorado2 text-white px-2 py-1 rounded-full">
                      Por defecto
                    </span>
                  )}
                </div>
              </div>
              
              {selectedCard?.id === card.id && (
                <div className="w-5 h-5 bg-dorado2 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Botón para agregar nueva tarjeta */}
      <button
        onClick={onAddNewCard}
        className="w-full p-3 border-2 border-dashed border-dorado3 rounded-lg text-dorado3 hover:bg-dorado4 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="font-lato font-medium">Agregar Nueva Tarjeta</span>
      </button>
    </div>
  );
};

export default CardSelector;
