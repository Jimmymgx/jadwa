import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { MessageSquare, Plus } from 'lucide-react';

export function ChatConsultations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الاستشارات النصية</h1>
          <p className="text-gray-600 mt-1">تواصل مع المستشارين عبر المحادثات</p>
        </div>
        <Button>
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            محادثة جديدة
          </div>
        </Button>
      </div>

      <Card>
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            لا توجد محادثات
          </h3>
          <p className="text-gray-500 mb-6">
            ابدأ محادثة جديدة مع أحد المستشارين
          </p>
          <Button>ابدأ محادثة</Button>
        </div>
      </Card>
    </div>
  );
}
