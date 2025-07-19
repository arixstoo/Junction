// Mock notification service - Backend developer will implement real SMS/WhatsApp
export interface NotificationService {
  sendSMS(to: string, message: string): Promise<boolean>
  sendWhatsApp(to: string, message: string): Promise<boolean>
}

export class MockNotificationService implements NotificationService {
  async sendSMS(to: string, message: string): Promise<boolean> {
    console.log(`📱 SMS sent to ${to}:`, message)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return true
  }

  async sendWhatsApp(to: string, message: string): Promise<boolean> {
    console.log(`💬 WhatsApp sent to ${to}:`, message)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200))
    return true
  }
}

export function formatAlertMessage(alert: any, language: "en" | "fr" = "en"): string {
  const messages = {
    en: {
      title: "🚨 OCEA Alert",
      pond: "Pond",
      parameter: "Parameter",
      value: "Value",
      status: "Status",
      time: "Time",
      action: "Please check your pond immediately.",
    },
    fr: {
      title: "🚨 Alerte OCEA",
      pond: "Bassin",
      parameter: "Paramètre",
      value: "Valeur",
      status: "Statut",
      time: "Heure",
      action: "Veuillez vérifier votre bassin immédiatement.",
    },
  }

  const msg = messages[language]

  return `${msg.title}

${msg.pond}: ${alert.pondName}
${msg.parameter}: ${alert.parameter}
${msg.value}: ${alert.message}
${msg.status}: ${alert.severity.toUpperCase()}
${msg.time}: ${new Date(alert.timestamp).toLocaleString()}

${msg.action}`
}

export async function sendAlertNotifications(
  alert: any,
  user: any,
  notificationService: NotificationService,
): Promise<void> {
  const message = formatAlertMessage(alert, user.language)

  const notifications = []

  if (user.notificationPreferences.sms && user.phone) {
    notifications.push(notificationService.sendSMS(user.phone, message))
  }

  if (user.notificationPreferences.whatsapp && user.phone) {
    notifications.push(notificationService.sendWhatsApp(user.phone, message))
  }

  await Promise.all(notifications)
}

// Export singleton instance
export const notificationService = new MockNotificationService()
