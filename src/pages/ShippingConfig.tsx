import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertTriangle, Truck, Settings, Package, Globe } from 'lucide-react';
import { getShippingConfig } from '@/services/shippingService';

const ShippingConfig: React.FC = () => {
  const [config, setConfig] = useState(getShippingConfig());
  
  const refreshConfig = () => {
    setConfig(getShippingConfig());
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Configuração do Sistema de Frete
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure e monitore a integração com serviços de entrega
        </p>
      </div>

      {/* Status da API */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Status da Integração MelhorEnvio
          </CardTitle>
          <CardDescription>
            Conectividade e configuração da API de frete
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {config.apiConfigured ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">API Token</span>
              </div>
              <Badge variant={config.apiConfigured ? "default" : "destructive"}>
                {config.apiConfigured ? "Configurado" : "Não configurado"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {config.sandboxMode ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <span className="font-medium">Ambiente</span>
              </div>
              <Badge variant={config.sandboxMode ? "secondary" : "default"}>
                {config.sandboxMode ? "Sandbox (Teste)" : "Produção"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Empresa</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {config.companyName}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-600" />
                <span className="font-medium">CEP de Origem</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {config.companyZipCode}
              </span>
            </div>
          </div>

          <Button onClick={refreshConfig} variant="outline" className="w-full">
            Atualizar Status
          </Button>
        </CardContent>
      </Card>

      {/* Alertas e instruções */}
      {!config.apiConfigured && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>API não configurada</AlertTitle>
          <AlertDescription>
            Para usar valores de frete reais, você precisa configurar a API do MelhorEnvio.
            Atualmente o sistema está usando valores simulados.
          </AlertDescription>
        </Alert>
      )}

      {config.sandboxMode && config.apiConfigured && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Modo Sandbox Ativo</AlertTitle>
          <AlertDescription>
            O sistema está em modo de teste. Os fretes são calculados com dados simulados.
            Para produção, altere VITE_MELHOR_ENVIO_SANDBOX para "false".
          </AlertDescription>
        </Alert>
      )}

      {/* Instruções de configuração */}
      <Card>
        <CardHeader>
          <CardTitle>Como Configurar a Integração Real</CardTitle>
          <CardDescription>
            Siga estes passos para ativar cálculos de frete reais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Criar conta no MelhorEnvio</h4>
                <p className="text-sm text-muted-foreground">
                  Acesse <code className="bg-gray-100 px-1 rounded">https://melhorenvio.com.br/</code> e crie uma conta gratuita.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold">Gerar Token de API</h4>
                <p className="text-sm text-muted-foreground">
                  Vá em <strong>Configurações → Tokens de acesso</strong> e gere um token para ambiente de Sandbox.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold">Configurar variáveis de ambiente</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Copie o arquivo <code className="bg-gray-100 px-1 rounded">.env.production</code> para <code className="bg-gray-100 px-1 rounded">.env</code> e substitua os valores:
                </p>
                <div className="bg-gray-50 p-3 rounded-md font-mono text-xs overflow-x-auto">
                  <div>VITE_MELHOR_ENVIO_TOKEN=seu_token_aqui</div>
                  <div>VITE_MELHOR_ENVIO_SANDBOX=true</div>
                  <div>VITE_COMPANY_NAME=Sua Empresa</div>
                  <div>VITE_COMPANY_ZIPCODE=SEU_CEP</div>
                  <div>VITE_COMPANY_DOCUMENT=SEU_CNPJ</div>
                  <div>VITE_COMPANY_PHONE=SEU_TELEFONE</div>
                  <div>VITE_COMPANY_EMAIL=SEU_EMAIL</div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold">Reiniciar aplicação</h4>
                <p className="text-sm text-muted-foreground">
                  Reinicie o servidor de desenvolvimento para aplicar as configurações.
                </p>
              </div>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Para Desenvolvedores:</AlertTitle>
            <AlertDescription>
              <div className="space-y-2 text-sm">
                <p><strong>Desenvolvimento:</strong> Use seu CPF e token sandbox para testar</p>
                <p><strong>Cliente/Produção:</strong> Cliente cria conta própria com CNPJ</p>
                <p><strong>Arquivos modelo:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><code>.env.development</code> - Para desenvolvimento</li>
                  <li><code>.env.production</code> - Template para cliente</li>
                  <li><code>CONFIGURACAO_CLIENTE.md</code> - Guia completo</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingConfig;
