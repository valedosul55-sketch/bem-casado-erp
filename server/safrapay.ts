import axios from "axios";

// Configurações do SafraPay (serão substituídas pelas credenciais reais)
const SAFRAPAY_API_URL = process.env.SAFRAPAY_API_URL || "https://api-sandbox.safrapay.com.br";
const SAFRAPAY_MERCHANT_ID = process.env.SAFRAPAY_MERCHANT_ID || "test_merchant";
const SAFRAPAY_API_KEY = process.env.SAFRAPAY_API_KEY || "test_api_key";

export interface SafraPayPaymentRequest {
  amount: number; // em centavos
  paymentMethod: "credit_card" | "debit_card" | "pix" | "food_voucher";
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  orderId: number;
  description: string;
  // Dados do cartão (se aplicável)
  cardNumber?: string;
  cardHolderName?: string;
  cardExpiryMonth?: string;
  cardExpiryYear?: string;
  cardCvv?: string;
}

export interface SafraPayPaymentResponse {
  success: boolean;
  transactionId?: string;
  status: "pending" | "processing" | "approved" | "failed";
  message?: string;
  paymentUrl?: string; // Para PIX ou redirect
}

/**
 * Processa pagamento via SafraPay
 * NOTA: Esta é uma implementação simulada para testes.
 * Quando tiver as credenciais reais do SafraPay, substitua pela API real.
 */
export async function processSafraPayPayment(
  request: SafraPayPaymentRequest
): Promise<SafraPayPaymentResponse> {
  try {
    // MODO DE TESTE: Simula aprovação automática
    // Quando tiver credenciais reais, descomente o código abaixo e remova a simulação
    
    /*
    const response = await axios.post(
      `${SAFRAPAY_API_URL}/v1/payments`,
      {
        merchant_id: SAFRAPAY_MERCHANT_ID,
        amount: request.amount,
        payment_method: request.paymentMethod,
        customer: {
          name: request.customerName,
          email: request.customerEmail,
          phone: request.customerPhone,
        },
        order_id: request.orderId.toString(),
        description: request.description,
        card: request.cardNumber ? {
          number: request.cardNumber,
          holder_name: request.cardHolderName,
          expiry_month: request.cardExpiryMonth,
          expiry_year: request.cardExpiryYear,
          cvv: request.cardCvv,
        } : undefined,
      },
      {
        headers: {
          "Authorization": `Bearer ${SAFRAPAY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: response.data.status === "approved",
      transactionId: response.data.transaction_id,
      status: response.data.status,
      message: response.data.message,
      paymentUrl: response.data.payment_url,
    };
    */

    // SIMULAÇÃO PARA TESTES
    console.log("[SafraPay] Processando pagamento (MODO TESTE):", request);
    
    // Simula delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simula aprovação automática
    return {
      success: true,
      transactionId: `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "approved",
      message: "Pagamento aprovado (simulação para testes)",
    };
  } catch (error) {
    console.error("[SafraPay] Erro ao processar pagamento:", error);
    return {
      success: false,
      status: "failed",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Consulta status de um pagamento
 */
export async function getSafraPayPaymentStatus(transactionId: string): Promise<SafraPayPaymentResponse> {
  try {
    // MODO DE TESTE: Retorna status aprovado
    // Quando tiver credenciais reais, descomente o código abaixo
    
    /*
    const response = await axios.get(
      `${SAFRAPAY_API_URL}/v1/payments/${transactionId}`,
      {
        headers: {
          "Authorization": `Bearer ${SAFRAPAY_API_KEY}`,
        },
      }
    );

    return {
      success: response.data.status === "approved",
      transactionId: response.data.transaction_id,
      status: response.data.status,
      message: response.data.message,
    };
    */

    // SIMULAÇÃO PARA TESTES
    return {
      success: true,
      transactionId,
      status: "approved",
      message: "Pagamento aprovado (simulação)",
    };
  } catch (error) {
    console.error("[SafraPay] Erro ao consultar status:", error);
    return {
      success: false,
      status: "failed",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
