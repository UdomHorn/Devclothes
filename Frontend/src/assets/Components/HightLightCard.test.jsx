import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import HightLightCard from './HightLightCard';

// 1. Mock the useFavorites hook
const mockToggleFavorite = vi.fn();
const mockIsFavorite = vi.fn().mockReturnValue(false);

vi.mock('../../context/FavoritesContext', () => ({
  useFavorites: () => ({
    toggleFavorite: mockToggleFavorite,
    isFavorite: mockIsFavorite,
  }),
}));

// 2. Mock the Cloudinary image optimizer utility so it returns standard URLs in tests
vi.mock('../../utils/cloudinary', () => ({
  getOptimizedImageUrl: (src) => src,
}));

describe('HightLightCard Component', () => {
  const mockProduct = {
    id: 10,
    name: 'Retro Jacket',
    price: 89.99,
  };

  it('renders product details correctly', () => {
    render(
      <MemoryRouter>
        <HightLightCard
          page="/product/10"
          src="http://example.com/image.jpg"
          price="$89.99"
          title="Retro Jacket"
          product={mockProduct}
        />
      </MemoryRouter>
    );

    // Verify title and price are rendered
    expect(screen.getByText('Retro Jacket')).toBeInTheDocument();
    expect(screen.getByText('$89.99')).toBeInTheDocument();
  });

  it('calls toggleFavorite when the favorite heart button is clicked', () => {
    render(
      <MemoryRouter>
        <HightLightCard
          page="/product/10"
          src="http://example.com/image.jpg"
          price="$89.99"
          title="Retro Jacket"
          product={mockProduct}
        />
      </MemoryRouter>
    );

    // Find the favorite button by its ARIA label and click it
    const favButton = screen.getByRole('button', { name: /favorite/i });
    fireEvent.click(favButton);

    // Verify that the mocked toggleFavorite function was called with the product object
    expect(mockToggleFavorite).toHaveBeenCalledWith(mockProduct);
  });
});
