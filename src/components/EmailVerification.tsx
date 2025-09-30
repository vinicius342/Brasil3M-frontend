import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, X } from 'lucide-react';

export const EmailVerification = () => {
  const { currentUser, sendVerificationEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const successMessageKey = `email-verified-${currentUser.uid}`;
    const hasShownSuccess = localStorage.getItem(successMessageKey);

    // Se o email foi verificado e ainda não mostrou a mensagem de sucesso
    if (currentUser.emailVerified && !hasShownSuccess) {
      setShowSuccessMessage(true);
      localStorage.setItem(successMessageKey, 'true');
    } else if (currentUser.emailVerified && hasShownSuccess) {
      setShowSuccessMessage(false);
    }
  }, [currentUser?.emailVerified, currentUser?.uid]);

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

  const handleDismissSuccess = () => {
    setShowSuccessMessage(false);
  };

  // Mostra mensagem de sucesso apenas uma vez
  if (currentUser.emailVerified && showSuccessMessage) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 flex items-center justify-between">
          <span>Seu e-mail foi verificado com sucesso!</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismissSuccess}
            className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Se email já verificado e mensagem já foi mostrada, não mostra nada
  if (currentUser.emailVerified) {
    return null;
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
