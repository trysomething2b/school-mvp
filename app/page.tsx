'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Student = {
  id: string;
  student_name: string;
  status: string;
};

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);

  // 1. 抓取初始數據
  const fetchStudents = async () => {
    const { data } = await supabase.from('daily_attendance').select('*').order('student_name');
    if (data) setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 2. 更新學生狀態
  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('daily_attendance').update({ status: newStatus, updated_at: new Date() }).eq('id', id);
    fetchStudents();
  };

  return (
    <main className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center">🏫 MVP 學校出席點名系統 (10人測試版)</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3">學生姓名</th>
              <th className="p-3">當前狀態</th>
              <th className="p-3 text-center">老師點名操作</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{student.student_name}</td>
                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    student.status === '準時' ? 'bg-green-100 text-green-800' :
                    student.status === '遲到' ? 'bg-yellow-100 text-yellow-800' :
                    student.status === '缺席' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="p-3 text-center space-x-2">
                  <button onClick={() => updateStatus(student.id, '準時')} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">準時</button>
                  <button onClick={() => updateStatus(student.id, '遲到')} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm">遲到</button>
                  <button onClick={() => updateStatus(student.id, '缺席')} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">缺席</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}