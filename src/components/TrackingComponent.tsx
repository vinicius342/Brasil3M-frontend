import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, MapPin, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { trackOrder, TrackingData } from "@/services/shippingService";

interface TrackingComponentProps {
  trackingCode: string;
  orderId?: string;
  className?: string;
}

const TrackingComponent = ({ trackingCode, orderId, className }: TrackingComponentProps) => {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackingInfo = async () => {
    if (!trackingCode) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await trackOrder(trackingCode);
      setTrackingData(data);
    } catch (err) {
      setError('Não foi possível buscar informações de rastreamento');
      console.error('Erro ao buscar rastreamento:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingInfo();
  }, [trackingCode]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregue':
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'em trânsito':
      case 'saiu para entrega':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'em preparação':
      case 'pedido criado':
        return <Package className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'entregue':
      case 'delivered':
        return 'default';
      case 'em trânsito':
      case 'saiu para entrega':
        return 'secondary';
      case 'cancelado':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (!trackingCode) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aguardando envio</h3>
          <p className="text-muted-foreground">
            Seu pedido está sendo preparado. O código de rastreamento será disponibilizado em breve.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Truck className="h-5 w-5" />
          <span>Rastreamento do Pedido</span>
        </CardTitle>
        <CardDescription>
          Código: <span className="font-mono font-semibold">{trackingCode}</span>
          {orderId && (
            <span className="ml-2">• Pedido #{orderId.slice(-8).toUpperCase()}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Buscando informações de rastreamento...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao buscar rastreamento</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchTrackingInfo} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        ) : trackingData ? (
          <div className="space-y-6">
            {/* Status Atual */}
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              {getStatusIcon(trackingData.status)}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold">{trackingData.status}</h4>
                  <Badge variant={getStatusVariant(trackingData.status)}>
                    Status Atual
                  </Badge>
                </div>
                {trackingData.estimatedDelivery && (
                  <p className="text-sm text-muted-foreground">
                    Previsão de entrega: {trackingData.estimatedDelivery}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Histórico de Movimentação */}
            <div>
              <h4 className="font-semibold mb-4">Histórico de Movimentação</h4>
              <div className="space-y-4">
                {trackingData.events.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">{event.status}</h5>
                        <span className="text-sm text-muted-foreground">{event.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      {event.location && (
                        <div className="flex items-center space-x-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão de Atualizar */}
            <div className="pt-4">
              <Button onClick={fetchTrackingInfo} variant="outline" className="w-full">
                <Truck className="h-4 w-4 mr-2" />
                Atualizar Rastreamento
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default TrackingComponent;
