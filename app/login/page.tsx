'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Student = {
  id?: string
  student_name: string
  status: string
}

export default function HomePage() {
  const supabase = createClient()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string>('')
  const [userRole, setUserRole] = useState<string>('student')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserAndData()
  }, [])

  const fetchUserAndData = async () => {
    // 1. 驗證目前用戶
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserEmail(user.email || '')

    // 2. 查詢角色權限
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)
      .maybeSingle()

    if (roleData && roleData.roles) {
      setUserRole((roleData.roles as any).name)
    }

    // 3. 讀取點名資料（已夾帶 Auth Token）
    const { data: attendanceData } = await supabase
      .from('daily_attendance')
      .select('*')
      .order('student_name', { ascending: true })

    if (attendanceData) {
      setStudents(attendanceData)
    }
    setLoading(false)
  }

  const handleStatusChange = async (studentName: string, newStatus: string) => {
    if (userRole !== 'teacher') return

    const { error } = await supabase
      .from('daily_attendance')
      .update({ status: newStatus })
      .eq('student_name', studentName)

    if (!error) {
      setStudents((prev) =>
        prev.map((s) => (s.student_name === studentName ? { ...s, status: newStatus } : s))
      )
    } else {
      alert('更新失敗：權限不足')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) return <div className="p-8 text-center">資料載入中...</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* 頂部身份資訊欄 */}
      <div className="flex justify-between items-center mb-6 bg-gray-100 p-4 rounded-lg">
        <div>
          <p className="font-bold text-gray-800">帳號：{userEmail}</p>
          <p className="text-sm text-gray-600">
            身份：<span className="font-semibold text-blue-600">{userRole === 'teacher' ? '老師 (可編輯)' : '學生 (唯讀)'}</span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          登出
        </button>
      </div>

      <h1 className="text-2xl font-bold text-center mb-6">🏫 MVP 學校出席點名系統</h1>

      {/* 點名表格 */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 text-left">學生姓名</th>
            <th className="border p-2 text-center">當前狀態</th>
            <th className="border p-2 text-center">老師點名操作</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.student_name}>
              <td className="border p-2">{student.student_name}</td>
              <td className="border p-2 text-center font-bold">{student.status}</td>
              <td className="border p-2 text-center">
                {userRole === 'teacher' ? (
                  <div className="flex justify-center gap-1">
                    <button
                      onClick={() => handleStatusChange(student.student_name, '準時')}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                    >
                      準時
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.student_name, '遲到')}
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                    >
                      遲到
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.student_name, '缺席')}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      缺席
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">僅供查看</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}