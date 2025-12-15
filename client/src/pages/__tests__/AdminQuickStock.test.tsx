import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminQuickStock } from '../AdminQuickStock';

// Mock do tRPC
vi.mock('@/lib/trpc', () => ({
  trpc: {
    stockMovements: {
      getByBarcode: {
        query: vi.fn(),
      },
      create: {
        mutate: vi.fn(),
      },
    },
    products: {
      create: {
        mutate: vi.fn(),
      },
    },
  },
}));

describe('AdminQuickStock - Formulário de Cadastro Rápido', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve mostrar formulário de cadastro quando produto não for encontrado', async () => {
    const user = userEvent.setup();
    
    // Mock: produto não encontrado (retorna null)
    const { trpc } = await import('@/lib/trpc');
    vi.mocked(trpc.stockMovements.getByBarcode.query).mockResolvedValue(null);

    render(<AdminQuickStock />);

    // Digitar código de barras
    const barcodeInput = screen.getByPlaceholderText(/escaneie ou digite/i);
    await user.type(barcodeInput, '7896285902015{Enter}');

    // Aguardar formulário aparecer
    await waitFor(() => {
      expect(screen.getByText(/cadastro rápido de produto/i)).toBeInTheDocument();
    });

    // Verificar se EAN13 está preenchido
    expect(screen.getByText(/EAN-13: 7896285902015/i)).toBeInTheDocument();

    // Verificar se campos do formulário existem
    expect(screen.getByLabelText(/nome do produto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preço/i)).toBeInTheDocument();
  });

  it('deve mostrar formulário de cadastro quando der erro na busca', async () => {
    const user = userEvent.setup();
    
    // Mock: erro na busca
    const { trpc } = await import('@/lib/trpc');
    vi.mocked(trpc.stockMovements.getByBarcode.query).mockRejectedValue(
      new Error('Produto não encontrado')
    );

    render(<AdminQuickStock />);

    // Digitar código de barras
    const barcodeInput = screen.getByPlaceholderText(/escaneie ou digite/i);
    await user.type(barcodeInput, '7896285902015{Enter}');

    // Aguardar formulário aparecer
    await waitFor(() => {
      expect(screen.getByText(/cadastro rápido de produto/i)).toBeInTheDocument();
    });

    // Verificar se EAN13 está preenchido
    expect(screen.getByText(/EAN-13: 7896285902015/i)).toBeInTheDocument();
  });

  it('NÃO deve mostrar formulário quando produto for encontrado', async () => {
    const user = userEvent.setup();
    
    // Mock: produto encontrado
    const { trpc } = await import('@/lib/trpc');
    vi.mocked(trpc.stockMovements.getByBarcode.query).mockResolvedValue({
      id: 1,
      name: 'Feijão Carioca',
      barcode: '7896285902015',
      price: 39.90,
      stock: 120,
    });

    render(<AdminQuickStock />);

    // Digitar código de barras
    const barcodeInput = screen.getByPlaceholderText(/escaneie ou digite/i);
    await user.type(barcodeInput, '7896285902015{Enter}');

    // Aguardar produto aparecer
    await waitFor(() => {
      expect(screen.getByText(/feijão carioca/i)).toBeInTheDocument();
    });

    // Verificar que formulário NÃO aparece
    expect(screen.queryByText(/cadastro rápido de produto/i)).not.toBeInTheDocument();
  });
});
