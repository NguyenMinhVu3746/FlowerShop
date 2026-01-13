/**
 * Email Service - Simple implementation
 * For production: Use services like SendGrid, AWS SES, Resend, etc.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email (mock implementation)
 * In production, integrate with real email service
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    // TODO: Integrate with real email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({ to, from: 'noreply@hoashop.com', subject, html });

    // For now, just log to console (development)
    console.log('=== EMAIL SENT ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', html);
    console.log('==================');

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_API_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e91e63; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { 
          display: inline-block; 
          padding: 12px 30px; 
          background: #e91e63; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌸 Hoa Shop - Đặt lại mật khẩu</h1>
        </div>
        <div class="content">
          <h2>Xin chào!</h2>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
          </p>
          <p>Hoặc copy link sau vào trình duyệt:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><strong>Link này sẽ hết hạn sau 1 giờ.</strong></p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
        <div class="footer">
          <p>© 2025 Hoa Shop - Hệ thống hoa tươi</p>
          <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '🌸 Đặt lại mật khẩu - Hoa Shop',
    html
  });
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  email: string, 
  orderId: string, 
  orderDetails: any
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e91e63; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .order-info { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌸 Xác nhận đơn hàng</h1>
        </div>
        <div class="content">
          <h2>Cảm ơn bạn đã đặt hàng!</h2>
          <p>Đơn hàng của bạn đã được tiếp nhận thành công.</p>
          <div class="order-info">
            <h3>Thông tin đơn hàng</h3>
            <p><strong>Mã đơn:</strong> ${orderId}</p>
            <p><strong>Tổng tiền:</strong> ${orderDetails.total} VNĐ</p>
            <p><strong>Trạng thái:</strong> ${orderDetails.status}</p>
          </div>
          <p>Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.</p>
        </div>
        <div class="footer">
          <p>© 2025 Hoa Shop - Hệ thống hoa tươi</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `🌸 Xác nhận đơn hàng #${orderId}`,
    html
  });
}
