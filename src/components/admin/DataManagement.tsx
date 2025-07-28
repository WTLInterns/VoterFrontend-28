import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button, Card } from '../ui';
import { Download, Trash2, AlertTriangle, Database, FileText } from 'lucide-react';

const DataManagement: React.FC = () => {
  const { exportData, loading } = useData();
  const { t } = useLanguage();



  const handleDataWipe = () => {
    const confirmed = confirm(t.dangerZone.confirmationWarning);

    if (confirmed) {
      const doubleConfirm = confirm(t.dangerZone.finalWarning);
      if (doubleConfirm) {
        // Note: clearAllData functionality not implemented
        alert(t.dangerZone.functionalityNotAvailable);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.sections.dataManagementSecurity}</h1>
        <p className="text-gray-600">{t.sections.manageSystemData}</p>
      </div>

      {/* Export Options */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-primary-600" />
            <h4 className="text-lg font-semibold text-gray-900">{t.sections.dataExportExcel}</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="primary"
              onClick={() => exportData('users')}
              disabled={loading}
              className="flex flex-col items-center p-6 h-auto"
            >
              <FileText className="w-8 h-8 mb-2" />
              <span>{loading ? t.sections.exporting : t.sections.exportUsers}</span>
            </Button>

            <Button
              variant="secondary"
              onClick={() => exportData('agents')}
              disabled={loading}
              className="flex flex-col items-center p-6 h-auto"
            >
              <FileText className="w-8 h-8 mb-2" />
              <span>{loading ? t.sections.exporting : t.sections.exportAgents}</span>
            </Button>

            <Button
              variant="success"
              onClick={() => exportData('all')}
              disabled={loading}
              className="flex flex-col items-center p-6 h-auto"
            >
              <Database className="w-8 h-8 mb-2" />
              <span>{loading ? t.sections.exporting : t.sections.exportAllData}</span>
            </Button>
          </div>
        </div>
      </Card>



      {/* Danger Zone */}
      <Card className="border-danger-200 bg-danger-50">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-danger-600" />
            <h4 className="text-lg font-semibold text-danger-900">{t.dangerZone.title}</h4>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-danger-200">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-danger-900 mb-1">{t.dangerZone.emergencyDataWipe}</h5>
                <p className="text-sm text-danger-700">
                  {t.dangerZone.wipeDescription}
                </p>
              </div>
              <Button
                variant="danger"
                onClick={handleDataWipe}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t.dangerZone.wipeAllData}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DataManagement;
