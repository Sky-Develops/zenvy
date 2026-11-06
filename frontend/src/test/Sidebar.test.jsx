import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

describe('Sidebar Component', () => {
  it('renders ZENVY brand and tagline', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Sidebar onOpenOmnibar={() => {}} />
      </BrowserRouter>
    );

    expect(screen.getByText('ZENVY')).toBeInTheDocument();
    expect(screen.getByText('Find Your Frequency.')).toBeInTheDocument();
  });

  it('contains navigation links for Beranda, Jelajahi, Cari, and Playlist', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Sidebar onOpenOmnibar={() => {}} />
      </BrowserRouter>
    );

    expect(screen.getByText('Beranda')).toBeInTheDocument();
    expect(screen.getByText('Jelajahi Suasana')).toBeInTheDocument();
    expect(screen.getByText('Cari')).toBeInTheDocument();
    expect(screen.getByText('Playlist')).toBeInTheDocument();
  });
});
