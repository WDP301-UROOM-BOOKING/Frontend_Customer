import api from "@libs/api/index";

class NotificationService {
  // Get user notifications
  static async getUserNotifications(page = 1, limit = 20, unreadOnly = false, type = null, priority = null) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (unreadOnly) params.append('unreadOnly', 'true');
    if (type) params.append('type', type);
    if (priority) params.append('priority', priority);

    const response = await api.get(`/notifications?${params.toString()}`);
    console.log("Response from getUserNotifications:", response.data);
    return response.data;
  }

  // Get notification by ID
  static async getNotificationById(notificationId) {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data;
  }

  // Get unread count
  static async getUnreadCount() {
    const response = await api.get('/notifications/count/unread');
    return response.data;
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  }

  // Mark all notifications as read
  static async markAllAsRead() {
    const response = await api.patch('/notifications/read/all');
    return response.data;
  }

  // Delete notification
  static async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }

  // Get notification statistics
  static async getNotificationStats() {
    const response = await api.get('/notifications/stats/summary');
    return response.data;
  }

  // Get notifications by type
  static async getNotificationsByType(type, page = 1, limit = 20) {
    const response = await api.get(`/notifications/type/${type}?page=${page}&limit=${limit}`);
    return response.data;
  }
}

export default NotificationService;