import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { MelhorEnvioAuth } from '../services/melhorEnvioAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Truck, CheckCircle, XCircle, ExternalLink, Unlink } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface MelhorEnvioConnectionProps {
  user: User;
}

export default function MelhorEnvioConnection({ user }: MelhorEnvioConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, [user]);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const connected = await MelhorEnvioAuth.isUserConnected(user.uid);
      setIsConnected(connected);
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    const authUrl = MelhorEnvioAuth.getAuthorizationUrl(user.uid);
    window.location.href = authUrl;
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await MelhorEnvioAuth.disconnectUser(user.uid);
      setIsConnected(false);
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            MelhorEnvio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-pulse text-sm text-gray-600">
              Verificando conexão...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          MelhorEnvio
          <Badge variant={isConnected ? 'default' : 'secondary'} className="ml-auto">
            {isConnected ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Conectado
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Desconectado
              </>
            )}
          </Badge>
        </CardTitle>
        <CardDescription>
          Conecte sua conta do MelhorEnvio para calcular fretes reais e gerenciar envios.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Sua conta do MelhorEnvio está conectada. Agora você pode calcular fretes reais e gerenciar envios diretamente pela plataforma.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                variant="outline"
                size="sm"
              >
                <Unlink className="h-4 w-4 mr-2" />
                {isDisconnecting ? 'Desconectando...' : 'Desconectar'}
              </Button>
              
              <Button
                onClick={() => window.open('https://sandbox.melhorenvio.com.br', '_blank')}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Painel MelhorEnvio
              </Button>
            </div>
          </>
        ) : (
          <>
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Para calcular fretes reais e gerenciar envios, você precisa conectar sua conta do MelhorEnvio.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Benefícios da conexão:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Cálculo de frete em tempo real</li>
                  <li>Múltiplas opções de transportadoras</li>
                  <li>Rastreamento automático</li>
                  <li>Geração de etiquetas</li>
                  <li>Gestão centralizada de envios</li>
                </ul>
              </div>
              
              <Button onClick={handleConnect} className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Conectar MelhorEnvio
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                Você será redirecionado para o MelhorEnvio para autorizar a conexão.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
