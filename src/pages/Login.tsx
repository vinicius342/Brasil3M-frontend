import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";

const Login = () => {
  useRedirectIfAuthenticated();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos."
      });
      return;
    }

    setLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "Sucesso!",
        description: "Login realizado com sucesso."
      });
      navigate("/");
    } catch (error: any) {
      let errorMessage = "Erro ao fazer login. Tente novamente.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "Usuário não encontrado.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Senha incorreta.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Email inválido.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
      }
      
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-sm md:max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Store className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <span className="text-xl md:text-2xl font-bold text-gradient">LojaOnline</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Bem-vindo de volta</h1>
          <p className="text-sm md:text-base text-muted-foreground">Entre na sua conta para continuar</p>
        </div>

        <Card>
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-lg md:text-xl">Entrar</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Digite suas credenciais para acessar sua conta
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
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link
                  to="/signup"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Cadastre-se
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

export default Login;
