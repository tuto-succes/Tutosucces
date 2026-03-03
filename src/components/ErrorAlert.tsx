import { AlertCircle, Settings } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorAlertProps {
  message: string;
  onDiagnostic?: () => void;
}

export function ErrorAlert({ message, onDiagnostic }: ErrorAlertProps) {
  return (
    <div 
      className="p-4 rounded-lg border-2 flex items-start gap-3"
      style={{ 
        backgroundColor: '#FFF3E0',
        borderColor: '#FFB74D'
      }}
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#F57C00' }} />
      <div className="flex-1">
        <p className="text-sm leading-relaxed" style={{ color: '#F57C00' }}>
          {message}
        </p>
        {onDiagnostic && (
          <Button
            onClick={onDiagnostic}
            variant="outline"
            size="sm"
            className="mt-3"
            style={{ 
              borderColor: '#F57C00',
              color: '#F57C00'
            }}
          >
            <Settings className="w-4 h-4 mr-2" />
            Exécuter le diagnostic
          </Button>
        )}
      </div>
    </div>
  );
}
