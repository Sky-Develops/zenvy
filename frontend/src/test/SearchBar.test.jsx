import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchBar from '../components/SearchBar';

describe('SearchBar Component', () => {
  it('renders search input with placeholder', () => {
    render(<SearchBar onSearch={() => {}} placeholder="Search testing..." />);
    const input = screen.getByPlaceholderText('Search testing...');
    expect(input).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted', () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);
    
    const input = screen.getByPlaceholderText(/Search songs, artists/i);
    fireEvent.change(input, { target: { value: 'Synthwave' } });

    const submitBtn = screen.getByRole('button', { name: /^Search$/i });
    fireEvent.click(submitBtn);

    expect(handleSearch).toHaveBeenCalledWith('Synthwave');
  });

  it('triggers search when quick tag button is clicked', () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const tagBtn = screen.getByText('Lofi Beats');
    fireEvent.click(tagBtn);

    expect(handleSearch).toHaveBeenCalledWith('Lofi Beats');
  });
});
