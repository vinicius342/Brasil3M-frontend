import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, AlertTriangle, CreditCard, Package, Users, Gavel } from "lucide-react";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <FileText className="h-10 w-10 text-primary" />
              Termos de Uso
            </h1>
            <p className="text-lg text-muted-foreground">
              Condições para uso da Loja Brasil 3M
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Última atualização: 30 de setembro de 2025
            </p>
          </div>

          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Ao usar nossa loja, você concorda com todos os termos descritos abaixo. 
              Leia atentamente antes de fazer qualquer compra.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  1. Sobre os Produtos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Natureza dos Itens:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Todos os produtos são itens virtuais para uso exclusivo no servidor DayZ Brasil 3M</li>
                    <li>Os itens não possuem valor monetário real fora do ambiente do jogo</li>
                    <li>Não garantimos a permanência dos itens em caso de wipe do servidor</li>
                    <li>Itens não podem ser transferidos para outros servidores ou jogadores sem autorização</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Entrega:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Itens são entregues diretamente no inventário do personagem no servidor</li>
                    <li>Prazo de entrega: até 24 horas após confirmação do pagamento</li>
                    <li>É necessário estar online no servidor para receber alguns itens</li>
                    <li>Mantenha seu nickname/Steam ID atualizado no perfil</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  2. Pagamentos e Reembolsos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Formas de Pagamento:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>PIX (processamento instantâneo)</li>
                    <li>Cartão de crédito/débito (processamento em até 2 dias úteis)</li>
                    <li>Boleto bancário (processamento em até 3 dias úteis)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Política de Reembolso:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>Direito de arrependimento:</strong> 7 dias corridos (CDC), apenas se o item não foi entregue</li>
                    <li><strong>Problemas técnicos:</strong> Reembolso integral se não conseguirmos entregar o item</li>
                    <li><strong>Ban por trapaça:</strong> Não há reembolso se o jogador for banido por uso de cheats</li>
                    <li><strong>Wipe do servidor:</strong> Não há reembolso em caso de reset oficial do servidor</li>
                  </ul>
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Atenção:</strong> Itens já utilizados ou consumidos no jogo não podem ser reembolsados.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  3. Responsabilidades do Usuário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Conta e Segurança:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Manter dados de login seguros e não compartilhar com terceiros</li>
                      <li>Informar imediatamente sobre uso não autorizado da conta</li>
                      <li>Manter informações de perfil atualizadas e corretas</li>
                      <li>Usar apenas um nickname/Steam ID por conta</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Conduta no Servidor:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Seguir todas as regras do servidor DayZ Brasil 3M</li>
                      <li>Não usar cheats, hacks ou exploits</li>
                      <li>Não revender itens por dinheiro real</li>
                      <li>Respeitar outros jogadores e staff</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-primary" />
                  4. Limitações e Exclusões
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Limitações de Responsabilidade:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Não nos responsabilizamos por perda de itens devido a bugs do jogo DayZ</li>
                    <li>Não garantimos disponibilidade 24/7 do servidor</li>
                    <li>Mudanças nas regras do servidor podem afetar itens comprados</li>
                    <li>Não nos responsabilizamos por ações de terceiros no servidor</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Suspensão de Contas:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Violação das regras do servidor ou da loja</li>
                    <li>Uso de informações falsas no cadastro</li>
                    <li>Atividade suspeita ou fraudulenta</li>
                    <li>Chargebacks ou contestações indevidas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Propriedade Intelectual</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Todos os direitos da marca "Brasil 3M" nos pertencem</li>
                  <li>• O conteúdo do site é protegido por direitos autorais</li>
                  <li>• DayZ é marca registrada da Bohemia Interactive</li>
                  <li>• Uso não autorizado pode resultar em ação legal</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Modificações dos Termos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Reservamos o direito de modificar estes termos a qualquer momento. Alterações serão:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Comunicadas através do Discord oficial</li>
                  <li>Enviadas por e-mail para usuários cadastrados</li>
                  <li>Publicadas no site com destaque</li>
                  <li>Efetivas 7 dias após a notificação</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Lei Aplicável e Foro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Estes termos são regidos pela legislação brasileira. Para resolução de conflitos, 
                  fica eleito o foro da comarca de <strong>[Sua Cidade]</strong>, com exclusão de qualquer outro, 
                  por mais privilegiado que seja.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Contato e Suporte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Discord:</strong> Servidor oficial Brasil 3M</p>
                  <p><strong>E-mail:</strong> suporte@brasil3m.com</p>
                  <p><strong>Horário de atendimento:</strong> Segunda a domingo, 9h às 22h</p>
                  <p><strong>Tempo de resposta:</strong> Até 24 horas em dias úteis</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <h3 className="font-bold text-lg mb-2">📢 Lembrete Importante</h3>
            <p className="text-muted-foreground">
              A compra de itens virtuais é uma forma de apoiar e manter o servidor Brasil 3M. 
              Seu investimento ajuda a melhorar a experiência de jogo para toda a comunidade!
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfUse;
