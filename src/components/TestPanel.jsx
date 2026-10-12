import { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { runAllTests } from '../tests/calculations.test';

export function TestPanel() {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    
    // Capturer les logs console
    const logs = [];
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      logs.push({ type: 'log', message: args.join(' ') });
      originalLog(...args);
    };
    
    console.error = (...args) => {
      logs.push({ type: 'error', message: args.join(' ') });
      originalError(...args);
    };
    
    try {
      const testResults = runAllTests();
      setResults({ ...testResults, logs });
    } catch (error) {
      setResults({ 
        passed: 0, 
        failed: 1, 
        total: 1, 
        logs: [{ type: 'error', message: error.message }] 
      });
    } finally {
      console.log = originalLog;
      console.error = originalError;
      setIsRunning(false);
    }
  };

  return (
    <Card className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gold mb-2">
            Tests du moteur de calcul
          </h2>
          <p className="text-gray-400">
            Validation des calculs fiscaux avec résultats attendus
          </p>
        </div>
        <Button 
          onClick={handleRunTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <Play className="w-5 h-5" />
          {isRunning ? 'Tests en cours...' : 'Lancer les tests'}
        </Button>
      </div>

      {results && (
        <>
          {/* Résumé */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-900/30 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">{results.passed}</p>
              <p className="text-sm text-green-600">Réussis</p>
            </div>
            
            <div className="bg-red-900/30 border border-red-200 rounded-lg p-4 text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-700">{results.failed}</p>
              <p className="text-sm text-red-600">Échoués</p>
            </div>
            
            <div className="bg-blue-900/30 border border-blue-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">{results.total}</p>
              <p className="text-sm text-blue-600">Total</p>
            </div>
          </div>

          {/* Logs détaillés */}
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
            {results.logs.map((log, index) => (
              <div 
                key={index} 
                className={`mb-1 ${log.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}
              >
                {log.message}
              </div>
            ))}
          </div>

          {/* Statut global */}
          <div className={`mt-6 p-4 rounded-lg text-center font-bold ${
            results.failed === 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {results.failed === 0 
              ? '✅ Tous les tests sont passés avec succès !' 
              : `❌ ${results.failed} test(s) ont échoué`}
          </div>
        </>
      )}

      {!results && (
        <div className="text-center py-12 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Cliquez sur "Lancer les tests" pour valider le moteur de calcul</p>
        </div>
      )}
    </Card>
  );
}
