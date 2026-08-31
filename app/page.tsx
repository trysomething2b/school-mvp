'use client';
import { useState } from 'react';

type Student = {
  id: string;
  student_name: string;
  status: string;
};

const initialStudents: Student[] = [
  { id: '1', student_name: '陳大文', status: '---' },
  { id: '2', student_name: '張小明', status: '---' },
  { id: '3', student_name: '李嘉慧', status: '---' },
  { id: '4', student_name: '黃子軒', status: '---' },
  { id: '5', student_name: '劉雅婷', status: '---' },
  { id: '6', student_name: '趙浩然', status: '---' },
  { id: '7', student_name: '吳美玲', status: '---' },
  { id: '8', student_name: '鄭宇軒', status: '---' },
  { id: '9', student_name: '謝紫晴', status: '---' },
  { id: '10', student_name: '林樂軒', status: '---' },
];

export default function Home() {
  const [students, setStudents] = useState<Student[]>(initialStudents);

  const updateStatus = (id: string, newStatus: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, status: newStatus } : student
      )
    );
  };

  return (
    <main className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center">
        🏫 MVP 學校出席點名系統 (10人測試版)
      </h1>

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
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      student.status === '準時'
                        ? 'bg-green-100 text-green-800'
                        : student.status === '遲到'
                        ? 'bg-yellow-100 text-yellow-800'
                        : student.status === '缺席'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => updateStatus(student.id, '準時')}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    準時
                  </button>
                  <button
                    onClick={() => updateStatus(student.id, '遲到')}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                  >
                    遲到
                  </button>
                  <button
                    onClick={() => updateStatus(student.id, '缺席')}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    缺席
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}