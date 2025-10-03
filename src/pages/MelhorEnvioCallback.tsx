import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { MelhorEnvioAuth } from '../services/melhorEnvioAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function MelhorEnvioCallback() {
  const [user, setUser] = useState<User | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user === null) return; // Ainda carregando o estado do usuário

    const handleCallback = async () => {
      if (!user) {
        setStatus('error');
        setError('Usuário não autenticado');
        return;
      }

      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      // Verifica se houve erro na autorização
      if (errorParam) {
        setStatus('error');
        setError(`Erro na autorização: ${errorParam}`);
        return;
      }

      // Verifica se o código foi fornecido
      if (!code) {
        setStatus('error');
        setError('Código de autorização não fornecido');
        return;
      }

      // Verifica se o state corresponde ao usuário atual (segurança)
      if (state !== user.uid) {
        setStatus('error');
        setError('Estado de segurança inválido');
        return;
      }

      try {
        // Troca o código por tokens
        await MelhorEnvioAuth.exchangeCodeForTokens(code, user.uid);
        setStatus('success');
        
        // Redireciona após 2 segundos
        setTimeout(() => {
          navigate('/seller', { replace: true });
        }, 2000);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    };

    handleCallback();
  }, [user, searchParams, navigate]);

  const handleRetry = () => {
    if (user) {
      const authUrl = MelhorEnvioAuth.getAuthorizationUrl(user.uid);
      window.location.href = authUrl;
    }
  };

  const handleGoBack = () => {
    navigate('/seller');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
            
            {status === 'loading' && 'Conectando...'}
            {status === 'success' && 'Conectado!'}
            {status === 'error' && 'Erro na Conexão'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processando sua autorização com o Melhor Envio...'}
            {status === 'success' && 'Sua conta foi conectada com sucesso ao Melhor Envio!'}
            {status === 'error' && 'Houve um problema ao conectar sua conta.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex justify-center">
              <div className="animate-pulse text-sm text-gray-600">
                Aguarde um momento...
              </div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Redirecionando para o painel do vendedor...
              </p>
              <Button onClick={handleGoBack} variant="outline" className="w-full">
                Ir para o Painel
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleRetry} className="flex-1">
                  Tentar Novamente
                </Button>
                <Button onClick={handleGoBack} variant="outline" className="flex-1">
                  Voltar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
