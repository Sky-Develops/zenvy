import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { PlayerProvider } from '../context/PlayerContext';

describe('Sidebar Component', () => {
  it('renders ZENVY brand', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PlayerProvider>
          <Sidebar onOpenOmnibar={() => {}} />
        </PlayerProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('ZENVY')).toBeInTheDocument();
  });

  it('contains navigation links for Home, Explore, Search, and Playlists', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PlayerProvider>
          <Sidebar onOpenOmnibar={() => {}} />
        </PlayerProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Playlists')).toBeInTheDocument();
  });
});
