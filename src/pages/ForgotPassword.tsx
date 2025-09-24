
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, digite seu email."
      });
      return;
    }

    setLoading(true);
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha."
      });
    } catch (error: any) {
      let errorMessage = "Erro ao enviar email. Tente novamente.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "Email não encontrado. Verifique se digitou corretamente.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Email inválido.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
      }
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-sm md:max-w-md">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Store className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <span className="text-xl md:text-2xl font-bold text-gradient">LojaOnline</span>
            </div>
          </div>

          <Card>
            <CardHeader className="text-center px-4 md:px-6">
              <div className="mx-auto mb-4 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <CardTitle className="text-lg md:text-xl">Email enviado!</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Enviamos um link de recuperação para <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              <p className="text-sm text-muted-foreground text-center">
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Não recebeu o email? Verifique sua pasta de spam ou{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => setIsSubmitted(false)}
                >
                  tente novamente
                </Button>
              </p>
              <div className="flex flex-col space-y-2">
                <Button asChild className="w-full">
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Voltar para a loja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-sm md:max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Store className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <span className="text-xl md:text-2xl font-bold text-gradient">LojaOnline</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Esqueceu a senha?</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Digite seu email para receber um link de recuperação
          </p>
        </div>

        <Card>
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-lg md:text-xl">Recuperar senha</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Informe o email associado à sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Lembrou da senha?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Voltar ao login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Voltar para a loja
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
