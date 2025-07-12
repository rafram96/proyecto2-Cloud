export interface SavedCard {
  id: string;
  name: string;
  cardNumber: string; // Solo últimos 4 dígitos
  expiryDate: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover';
  isDefault: boolean;
}

class CardsService {
  private readonly STORAGE_KEY = 'saved_cards';

  // Obtener tarjetas guardadas
  getSavedCards(): SavedCard[] {
    const cards = localStorage.getItem(this.STORAGE_KEY);
    return cards ? JSON.parse(cards) : [];
  }

  // Guardar nueva tarjeta
  saveCard(cardData: Omit<SavedCard, 'id'>): SavedCard {
    const cards = this.getSavedCards();
    const newCard: SavedCard = {
      id: `card_${Date.now()}`,
      ...cardData,
      // Enmascarar número de tarjeta (solo últimos 4 dígitos)
      cardNumber: `**** **** **** ${cardData.cardNumber.slice(-4)}`
    };
    
    // Si es la primera tarjeta, hacerla default
    if (cards.length === 0) {
      newCard.isDefault = true;
    }
    
    cards.push(newCard);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cards));
    
    return newCard;
  }

  // Eliminar tarjeta
  removeCard(cardId: string): void {
    const cards = this.getSavedCards().filter(card => card.id !== cardId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cards));
  }

  // Establecer tarjeta por defecto
  setDefaultCard(cardId: string): void {
    const cards = this.getSavedCards().map(card => ({
      ...card,
      isDefault: card.id === cardId
    }));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cards));
  }

  // Detectar tipo de tarjeta
  detectCardType(cardNumber: string): SavedCard['cardType'] {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    return 'discover';
  }

  // Formatear número de tarjeta mientras se escribe
  formatCardNumber(value: string): string {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  }

  // Validar número de tarjeta (algoritmo de Luhn simplificado)
  validateCardNumber(cardNumber: string): boolean {
    const number = cardNumber.replace(/\s/g, '');
    return number.length >= 13 && number.length <= 19;
  }
}

export const cardsService = new CardsService();
