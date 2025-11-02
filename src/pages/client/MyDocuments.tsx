import { Card } from '../../components/Card';
import { FileText, Download } from 'lucide-react';

export function MyDocuments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">مستنداتي</h1>
        <p className="text-gray-600 mt-1">جميع الملفات والتقارير المرفوعة والمستلمة</p>
      </div>

      <Card>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            لا توجد مستندات
          </h3>
          <p className="text-gray-500">
            ستظهر هنا جميع المستندات المرتبطة بطلباتك
          </p>
        </div>
      </Card>
    </div>
  );
}
