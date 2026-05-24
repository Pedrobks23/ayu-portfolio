import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CropModal from '@/components/admin/CropModal';

// react-easy-crop usa canvas/ResizeObserver que não existe em happy-dom.
// O mock chama onCropComplete de forma síncrona via useEffect para simular
// o comportamento real do cropper após o primeiro render.
vi.mock('react-easy-crop', async () => {
  const { useEffect } = await import('react');
  return {
    default: ({ onCropComplete }) => {
      useEffect(() => {
        onCropComplete({}, { x: 50, y: 60, width: 400, height: 400 });
      }, []);
      return <div data-testid="cropper-mock" />;
    },
  };
});

describe('CropModal', () => {
  it('renderiza o título, legenda e botões', () => {
    render(
      <CropModal
        imagemUrl="https://example.com/img.jpg"
        onConfirmar={vi.fn()}
        onFechar={vi.fn()}
      />
    );
    expect(screen.getByText(/ajustar enquadramento/i)).toBeInTheDocument();
    expect(screen.getByText(/confirmar/i)).toBeInTheDocument();
    expect(screen.getByText(/cancelar/i)).toBeInTheDocument();
    expect(screen.getByText(/arraste e use o zoom/i)).toBeInTheDocument();
  });

  it('chama onFechar ao clicar em Cancelar', () => {
    const onFechar = vi.fn();
    render(
      <CropModal
        imagemUrl="https://example.com/img.jpg"
        onConfirmar={vi.fn()}
        onFechar={onFechar}
      />
    );
    fireEvent.click(screen.getByText(/cancelar/i));
    expect(onFechar).toHaveBeenCalledOnce();
  });

  it('chama onFechar ao clicar no overlay', () => {
    const onFechar = vi.fn();
    const { container } = render(
      <CropModal
        imagemUrl="https://example.com/img.jpg"
        onConfirmar={vi.fn()}
        onFechar={onFechar}
      />
    );
    fireEvent.click(container.firstChild);
    expect(onFechar).toHaveBeenCalledOnce();
  });

  it('não fecha ao clicar dentro do modal', () => {
    const onFechar = vi.fn();
    render(
      <CropModal
        imagemUrl="https://example.com/img.jpg"
        onConfirmar={vi.fn()}
        onFechar={onFechar}
      />
    );
    fireEvent.click(screen.getByText(/ajustar enquadramento/i));
    expect(onFechar).not.toHaveBeenCalled();
  });

  it('chama onConfirmar com { x, y, w, h } após crop completo', async () => {
    const onConfirmar = vi.fn();
    await act(async () => {
      render(
        <CropModal
          imagemUrl="https://example.com/img.jpg"
          onConfirmar={onConfirmar}
          onFechar={vi.fn()}
        />
      );
    });
    fireEvent.click(screen.getByText(/confirmar/i));
    expect(onConfirmar).toHaveBeenCalledWith({ x: 50, y: 60, w: 400, h: 400 });
  });

  it('slider de zoom está presente e responsivo', () => {
    render(
      <CropModal
        imagemUrl="https://example.com/img.jpg"
        onConfirmar={vi.fn()}
        onFechar={vi.fn()}
      />
    );
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: '2' } });
    expect(Number(slider.value)).toBe(2);
  });
});
