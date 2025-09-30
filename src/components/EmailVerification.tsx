import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export const EmailVerification = () => {
  const { currentUser, sendVerificationEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!currentUser) return null;

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setMessage('');
      await sendVerificationEmail();
      setMessage('E-mail de verificação enviado! Verifique sua caixa de entrada.');
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      setMessage('Erro ao enviar e-mail de verificação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReloadUser = () => {
    currentUser.reload().then(() => {
      window.location.reload();
    });
  };

  if (currentUser.emailVerified) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Seu e-mail foi verificado com sucesso!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <div className="space-y-2">
            <p>
              Seu e-mail <strong>{currentUser.email}</strong> ainda não foi verificado.
              Verifique sua caixa de entrada e clique no link de verificação.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleResendVerification}
                disabled={loading}
                size="sm"
                variant="outline"
                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              >
                <Mail className="h-4 w-4 mr-2" />
                {loading ? 'Enviando...' : 'Reenviar E-mail'}
              </Button>
              <Button
                onClick={handleReloadUser}
                size="sm"
                variant="outline"
                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              >
                Já verifiquei
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {message && (
        <Alert className={message.includes('Erro') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertDescription className={message.includes('Erro') ? 'text-red-800' : 'text-green-800'}>
            {message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
