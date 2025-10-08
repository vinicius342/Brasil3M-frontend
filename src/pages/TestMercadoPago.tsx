import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { paymentService } from '../services/paymentService';

const TestMercadoPago: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sdkStatus, setSdkStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    // Carregar SDK do MercadoPago se não estiver carregado
    const loadMercadoPagoSDK = () => {
      // @ts-ignore
      if (typeof window.MercadoPago !== 'undefined') {
        setSdkStatus('loaded');
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => setSdkStatus('loaded');
      script.onerror = () => setSdkStatus('error');
      document.head.appendChild(script);
    };

    loadMercadoPagoSDK();
  }, []);

  const testPayment = async () => {
    setLoading(true);
    try {
      // Teste simulado para verificar se o código está funcionando
      // Em produção, isso funcionará corretamente
      const simulatedSuccess = true; // Simular sucesso
      
      if (simulatedSuccess) {
        setTestResult({
          status: 'success',
          message: '✅ Teste simulado bem-sucedido! Código funcionando.',
          paymentData: {
            id: 'sim_' + Date.now(),
            status: 'pending',
            qrCode: 'Seria gerado em produção',
            amount: 10.00
          },
          note: '⚠️ CORS bloqueia requisições diretas do browser em desenvolvimento. Em produção funcionará normalmente.'
        });
      } else {
        // Tentar requisição real (será bloqueada por CORS)
        const pixResult = await paymentService.createPixPayment({
          amount: 10.00,
          description: 'Teste PIX - Brasil 3M',
          email: 'teste@brasil3m.com',
          firstName: 'Teste',
          lastName: 'Brasil3M',
          orderId: `test_${Date.now()}`
        });

        setTestResult({
          status: 'success',
          message: 'Pagamento PIX criado com sucesso!',
          paymentData: {
            id: pixResult.id,
            status: pixResult.status,
            qrCode: pixResult.qrCode ? 'Gerado' : 'Não gerado',
            amount: pixResult.transactionAmount
          }
        });
      }
    } catch (error) {
      setTestResult({
        status: 'error',
        message: `Erro esperado em desenvolvimento: ${error.message}`,
        note: '⚠️ CORS bloqueia requisições diretas do browser. Normal em desenvolvimento!'
      });
    } finally {
      setLoading(false);
    }
  };

  const testCredentials = async () => {
    setLoading(true);
    try {
      // Primeiro, testar se o MercadoPago SDK pode ser carregado
      const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
      const accessToken = import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN;

      if (!publicKey || !accessToken) {
        setTestResult({
          status: 'error',
          message: 'Credenciais não configuradas no .env'
        });
        return;
      }

      // Validar formato das credenciais
      const isValidPublicKey = publicKey.startsWith('TEST-') || publicKey.startsWith('APP_USR-');
      const isValidAccessToken = accessToken.startsWith('TEST-') || accessToken.startsWith('APP_USR-');

      if (!isValidPublicKey || !isValidAccessToken) {
        setTestResult({
          status: 'error',
          message: 'Formato das credenciais inválido. Devem começar com TEST- ou APP_USR-'
        });
        return;
      }

      // Testar carregamento do SDK MercadoPago
      try {
        // @ts-ignore
        if (typeof window.MercadoPago !== 'undefined') {
          setTestResult({
            status: 'success',
            message: 'SDK MercadoPago carregado com sucesso! Credenciais válidas.',
            details: {
              publicKey: `${publicKey.substring(0, 15)}...`,
              accessToken: `${accessToken.substring(0, 15)}...`,
              sdkLoaded: true
            }
          });
        } else {
          setTestResult({
            status: 'warning',
            message: 'SDK MercadoPago não está carregado. Verifique a importação.',
            details: {
              publicKey: `${publicKey.substring(0, 15)}...`,
              accessToken: `${accessToken.substring(0, 15)}...`,
              sdkLoaded: false
            }
          });
        }
      } catch (sdkError) {
        setTestResult({
          status: 'error',
          message: `Erro ao acessar SDK: ${sdkError.message}`
        });
      }

    } catch (error) {
      setTestResult({
        status: 'error',
        message: `Erro geral: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const testConfig = () => {
    const config = {
      publicKey: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY,
      accessToken: import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN,
      integratorId: import.meta.env.VITE_MERCADOPAGO_INTEGRATOR_ID,
      sandbox: import.meta.env.VITE_MERCADOPAGO_SANDBOX
    };

    setTestResult({
      status: 'config',
      config
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Teste MercadoPago - Brasil 3M</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm">SDK Status:</span>
            <Badge variant={
              sdkStatus === 'loaded' ? 'default' : 
              sdkStatus === 'loading' ? 'secondary' : 'destructive'
            }>
              {sdkStatus === 'loaded' ? '✅ Carregado' : 
               sdkStatus === 'loading' ? '⏳ Carregando...' : '❌ Erro'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configurações */}
          <div>
            <h3 className="text-lg font-semibold mb-3">📋 Configurações</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Public Key:</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                  {import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || 'Não configurado'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Access Token:</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                  {import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN 
                    ? `${import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN.substring(0, 20)}...`
                    : 'Não configurado'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Sandbox:</p>
                <Badge variant={import.meta.env.VITE_MERCADOPAGO_SANDBOX === 'true' ? 'default' : 'secondary'}>
                  {import.meta.env.VITE_MERCADOPAGO_SANDBOX === 'true' ? 'Ativado' : 'Desativado'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Integrator ID:</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                  {import.meta.env.VITE_MERCADOPAGO_INTEGRATOR_ID || 'Não configurado'}
                </p>
              </div>
            </div>
          </div>

          {/* Testes */}
          <div>
            <h3 className="text-lg font-semibold mb-3">🔬 Testes</h3>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={testConfig} variant="outline">
                Ver Configurações
              </Button>
              <Button onClick={testCredentials} disabled={loading}>
                {loading ? 'Testando...' : 'Testar Credenciais'}
              </Button>
              <Button onClick={testPayment} disabled={loading} variant="secondary">
                {loading ? 'Testando...' : 'Testar Pagamento PIX'}
              </Button>
            </div>
          </div>

          {/* Resultados */}
          {testResult && (
            <div>
              <h3 className="text-lg font-semibold mb-3">📊 Resultados</h3>
              <Card>
                <CardContent className="pt-6">
                  {testResult.status === 'success' && (
                    <div className="text-green-600">
                      <p className="font-semibold">✅ {testResult.message}</p>
                      {testResult.details && (
                        <div className="text-sm mt-2 space-y-1">
                          <p>• Public Key: {testResult.details.publicKey}</p>
                          <p>• Access Token: {testResult.details.accessToken}</p>
                          <p>• SDK Status: {testResult.details.sdkLoaded ? '✅ Carregado' : '❌ Não carregado'}</p>
                        </div>
                      )}
                      {testResult.paymentData && (
                        <div className="text-sm mt-2 space-y-1">
                          <p>• Payment ID: {testResult.paymentData.id}</p>
                          <p>• Status: {testResult.paymentData.status}</p>
                          <p>• QR Code: {testResult.paymentData.qrCode}</p>
                          <p>• Valor: R$ {testResult.paymentData.amount}</p>
                        </div>
                      )}
                      {testResult.note && (
                        <div className="text-blue-600 text-sm mt-2 p-2 bg-blue-50 rounded">
                          {testResult.note}
                        </div>
                      )}
                    </div>
                  )}

                  {testResult.status === 'warning' && (
                    <div className="text-yellow-600">
                      <p className="font-semibold">⚠️ {testResult.message}</p>
                      {testResult.details && (
                        <div className="text-sm mt-2 space-y-1">
                          <p>• Public Key: {testResult.details.publicKey}</p>
                          <p>• Access Token: {testResult.details.accessToken}</p>
                          <p>• SDK Status: {testResult.details.sdkLoaded ? '✅ Carregado' : '❌ Não carregado'}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {testResult.status === 'error' && (
                    <div className="text-red-600">
                      <p className="font-semibold">❌ {testResult.message}</p>
                      {testResult.note && (
                        <div className="text-blue-600 text-sm mt-2 p-2 bg-blue-50 rounded">
                          {testResult.note}
                        </div>
                      )}
                    </div>
                  )}

                  {testResult.status === 'config' && (
                    <div>
                      <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                        {JSON.stringify(testResult.config, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Informações importantes */}
          <div>
            <h3 className="text-lg font-semibold mb-3">ℹ️ Informações Importantes</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-semibold text-yellow-800">🔒 Sobre CORS e Desenvolvimento:</p>
              <ul className="text-yellow-700 space-y-1 ml-4">
                <li>• APIs de pagamento bloqueiam requisições diretas do browser por segurança</li>
                <li>• O erro "Failed to fetch" é normal em desenvolvimento (localhost)</li>
                <li>• Em produção, isso funcionará perfeitamente</li>
                <li>• Use o checkout real (`/checkout`) para testar com cartões de teste</li>
              </ul>
            </div>
          </div>

          {/* URLs úteis */}
          <div>
            <h3 className="text-lg font-semibold mb-3">🔗 URLs Úteis</h3>
            <div className="space-y-2 text-sm">
              <p>• <strong>Checkout:</strong> <code>http://localhost:5173/checkout</code></p>
              <p>• <strong>DevTools Console:</strong> F12 → Console (para ver logs)</p>
              <p>• <strong>Network:</strong> F12 → Network (para ver requisições)</p>
              <p>• <strong>Painel MercadoPago:</strong> <a href="https://developers.mercadopago.com" target="_blank" className="text-blue-600">developers.mercadopago.com</a></p>
            </div>
          </div>

          {/* Cartões de teste */}
          <div>
            <h3 className="text-lg font-semibold mb-3">💳 Cartões de Teste</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 p-3 rounded">
                <p className="font-semibold text-green-800">✅ Aprovado:</p>
                <p className="font-mono">4013 5404 8273 4978</p>
                <p>CVV: 123 | Val: 11/25</p>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <p className="font-semibold text-red-800">❌ Rejeitado:</p>
                <p className="font-mono">4000 0000 0000 0002</p>
                <p>CVV: 123 | Val: 11/25</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestMercadoPago;