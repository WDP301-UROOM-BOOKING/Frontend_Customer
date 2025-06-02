"use client"
import { showToast, ToastProvider } from "./components/toast-system"

function App() {
  const handleShowSuccessToast = () => {
    showToast.success("Thao tác thành công!")
  }

  const handleShowErrorToast = () => {
    showToast.error("Đã a ra lỗi!")
  }

  const handleShowInfoToast = () => {
    showToast.info("Thông tin mới!")
  }

  const handleShowWarningToast = () => {
    showToast.warning("Cảnh báo!")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Hệ thống Toast</h1>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleShowSuccessToast}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Thành công
          </button>

          <button
            onClick={handleShowErrorToast}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Lỗi
          </button>

          <button
            onClick={handleShowInfoToast}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Thông tin
          </button>

          <button
            onClick={handleShowWarningToast}
            className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Cảnh báo
          </button>
        </div>
      </div>

      {/* Toast Container */}
      <ToastProvider />
    </div>
  )
}

export default App

