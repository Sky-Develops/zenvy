import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import MusicCard from '../components/MusicCard';
import { PlayerProvider } from '../context/PlayerContext';

const mockTrack = {
  id: 'test_vid_123',
  videoId: 'test_vid_123',
  title: 'Cyberpunk Focus Beat',
  channelTitle: 'Synth Master',
  thumbnailUrl: 'https://example.com/thumb.jpg'
};

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <PlayerProvider>
        {ui}
      </PlayerProvider>
    </BrowserRouter>
  );
};

describe('MusicCard Component', () => {
  it('renders track title and channel name', () => {
    renderWithProviders(<MusicCard music={mockTrack} />);
    expect(screen.getByText('Cyberpunk Focus Beat')).toBeInTheDocument();
    expect(screen.getByText('Synth Master')).toBeInTheDocument();
  });

  it('triggers onToggleFavorite when heart icon is clicked', () => {
    const handleToggleFavorite = vi.fn();
    renderWithProviders(
      <MusicCard music={mockTrack} onToggleFavorite={handleToggleFavorite} />
    );

    const favButton = screen.getByTitle('Add to favorites');
    fireEvent.click(favButton);

    expect(handleToggleFavorite).toHaveBeenCalledWith(mockTrack);
  });
});

