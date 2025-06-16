
import { useEffect, useRef } from "react"
import { useAppDispatch } from "@redux/store"
import ChatboxActions from "@redux/chatbox/actions"

export const useAutoExpire = (intervalMs = 1000) => {
  const dispatch = useAppDispatch()
  const intervalRef = useRef(null)

  useEffect(() => {
    // Tạo interval để kiểm tra expire mỗi giây
    intervalRef.current = setInterval(() => {
      dispatch({ type: ChatboxActions.CHECK_EXPIRE })
    }, intervalMs)
    console.log("Auto expire started with interval:", intervalMs)

    // Cleanup khi component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [dispatch, intervalMs])

  // Cleanup function để có thể dừng interval từ bên ngoài
  const stopAutoExpire = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  return { stopAutoExpire }
}
