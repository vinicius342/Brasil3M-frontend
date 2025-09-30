import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Database, Users, Clock } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <Shield className="h-10 w-10 text-primary" />
              Política de Privacidade
            </h1>
            <p className="text-lg text-muted-foreground">
              Como protegemos e utilizamos suas informações pessoais
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Última atualização: 30 de setembro de 2025
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  1. Informações que Coletamos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Dados Pessoais:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Nome completo e e-mail (obrigatórios para cadastro)</li>
                    <li>Telefone e CPF (para verificação e segurança)</li>
                    <li>Dados de pagamento (processados por terceiros seguros)</li>
                    <li>Endereços de entrega (quando aplicável)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Dados de Gaming:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Nickname/Steam ID do servidor DayZ</li>
                    <li>Histórico de compras de itens virtuais</li>
                    <li>Logs de entrega de itens no servidor</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Dados Técnicos:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Endereço IP e dados de navegação</li>
                    <li>Cookies e preferências do site</li>
                    <li>Informações do dispositivo e browser</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  2. Como Utilizamos suas Informações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Processamento de Pedidos:</strong> Para processar compras e entregar itens no servidor DayZ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Comunicação:</strong> Para enviar confirmações, atualizações e suporte ao cliente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Segurança:</strong> Para prevenir fraudes e proteger a integridade do servidor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Melhorias:</strong> Para aprimorar nossos serviços e experiência do usuário</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  3. Compartilhamento de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Não vendemos suas informações pessoais. Compartilhamos dados apenas quando necessário:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Processadores de Pagamento:</strong> Para processar transações financeiras</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Administradores do Servidor:</strong> Para entrega de itens virtuais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Autoridades Legais:</strong> Quando exigido por lei</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  4. Seus Direitos (LGPD)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  De acordo com a Lei Geral de Proteção de Dados, você tem os seguintes direitos:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Direitos de Acesso:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Confirmar existência de tratamento</li>
                      <li>• Acessar seus dados</li>
                      <li>• Corrigir dados incompletos/incorretos</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Direitos de Controle:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Solicitar exclusão de dados</li>
                      <li>• Revogar consentimento</li>
                      <li>• Portabilidade dos dados</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Para exercer seus direitos:</strong> Entre em contato conosco através do Discord ou e-mail de suporte.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  5. Retenção e Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Período de Retenção:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Dados de conta: Enquanto a conta estiver ativa</li>
                    <li>Histórico de compras: 5 anos (obrigação legal)</li>
                    <li>Logs de sistema: 6 meses</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Medidas de Segurança:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Criptografia SSL/TLS para transmissão de dados</li>
                    <li>Senhas criptografadas com hash seguro</li>
                    <li>Acesso restrito aos dados por funcionários autorizados</li>
                    <li>Backups seguros e monitoramento constante</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Contato</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Para questões sobre privacidade ou exercer seus direitos:
                </p>
                <div className="space-y-2">
                  <p><strong>Discord:</strong> Servidor oficial Brasil 3M</p>
                  <p><strong>E-mail:</strong> privacidade@brasil3m.com</p>
                  <p><strong>Horário:</strong> Segunda a sexta, 9h às 18h</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Esta política pode ser atualizada periodicamente. Alterações significativas serão comunicadas 
              através do Discord e e-mail cadastrado.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
