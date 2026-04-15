import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Transporter for support related emails (password reset, customer support)
const supportTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SUPPORT_EMAIL || 'mangalamflorist.support@gmail.com',
    pass: process.env.SUPPORT_EMAIL_PASS 
  }
});

// Transporter for order related emails (order notifications, receipts)
const workTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.WORK_EMAIL || 'mangalamflorist.work@gmail.com',
    pass: process.env.WORK_EMAIL_PASS
  }
});

/**
 * Send Password Reset OTP
 */
export const sendResetOTPMail = async (to, otp) => {
  const mailOptions = {
    from: `"Mangalam Florist Support" <${process.env.SUPPORT_EMAIL || 'mangalamflorist.support@gmail.com'}>`,
    to,
    subject: 'Password Reset OTP - Mangalam Florist',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #d23669; margin: 0;">Mangalam Florist</h1>
          <p style="color: #666; font-size: 14px;">Expressing through flowers</p>
        </div>
        <div style="background-color: #fce4ec; padding: 30px; border-radius: 8px; text-align: center;">
          <h2 style="color: #880e4f; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Use the following OTP to reset your password. This OTP is valid for 10 minutes.</p>
          <div style="background: white; padding: 15px 30px; display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #d23669; border: 2px dashed #d23669; border-radius: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #777; font-size: 12px; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
          <p>&copy; 2026 Mangalam Florist. All rights reserved.</p>
        </div>
      </div>
    `
  };

  return supportTransporter.sendMail(mailOptions);
};

/**
 * Send Order Notification to the Admin (using Work Email)
 */
export const sendOrderNotificationToAdmin = async (order) => {
  const fromEmail = process.env.WORK_EMAIL || 'mangalamflorist.work@gmail.com';
  const mailOptions = {
    from: `"Mangalam Florist Orders" <${fromEmail}>`,
    to: fromEmail, // Sending to the same work email
    subject: `New Order Received - #${order.orderId}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; border-bottom: 2px solid #fce4ec; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="color: #d23669; margin: 0;">New Order Alert!</h1>
          <p style="color: #666;">Order ID: <strong>${order.orderId}</strong></p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #880e4f; border-left: 4px solid #d23669; padding-left: 10px;">Customer Details</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${order.customerName}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.phone}</p>
          <p style="margin: 5px 0;"><strong>Address:</strong> ${
            order.address.addressLine1 || order.address.line1
          }${
            (order.address.landmark || order.address.line2) ? `, ${order.address.landmark || order.address.line2}` : ''
          }, ${
            order.address.city
          } - ${order.address.postalCode || order.address.zip}</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: #880e4f; border-left: 4px solid #d23669; padding-left: 10px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #fce4ec; text-align: left;">
                <th style="padding: 10px;">Item</th>
                <th style="padding: 10px;">Qty</th>
                <th style="padding: 10px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px;">
                    ${item.name}${item.isCustom ? ' (Custom)' : ''}
                    ${item.isCustom && item.custom ? `
                      <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        • Base: ${item.custom.base?.name || 'N/A'}<br>
                        • Paper: ${(item.custom.paper || item.custom.wrapper)?.name || 'N/A'}<br>
                        • Ribbon: ${item.custom.ribbon?.name || 'N/A'}
                        ${item.custom.additions?.length > 0 ? `<br>• Additions: ${item.custom.additions.map(a => `${a.item.name} (x${a.qty})`).join(', ')}` : ''}
                      </div>
                    ` : ''}
                  </td>
                  <td style="padding: 10px;">${item.quantity}</td>
                  <td style="padding: 10px;">₹${item.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="text-align: right; margin-top: 15px; font-size: 18px;">
            <p><strong>Total Amount:</strong> <span style="color: #d23669;">₹${order.totalAmount}</span></p>
          </div>
        </div>

        <div style="margin-bottom: 25px; background-color: #fff9f9; padding: 15px; border-radius: 8px;">
          <h3 style="color: #880e4f; margin-top: 0;">Delivery Preferences</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${order.deliveryDate ? new Date(order.deliveryDate).toDateString() : 'Today'}</p>
          <p style="margin: 5px 0;"><strong>Slot:</strong> ${order.deliveryTime === 'ASAP' ? 'Standard Delivery (ASAP)' : order.deliveryTime}</p>
          ${order.specialRequest ? `<p style="margin: 5px 0;"><strong>Special Request:</strong> ${order.specialRequest}</p>` : ''}
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="https://mangalamflorist.com/admin/orders/${order._id}" style="background-color: #d23669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View in Admin Panel</a>
        </div>
      </div>
    `
  };

  return workTransporter.sendMail(mailOptions);
};

/**
 * Send Order Confirmation to the Customer (using Work Email)
 */
export const sendOrderConfirmationToCustomer = async (order, customerEmail) => {
  const fromEmail = process.env.WORK_EMAIL || 'mangalamflorist.work@gmail.com';
  const mailOptions = {
    from: `"Mangalam Florist" <${fromEmail}>`,
    to: customerEmail,
    subject: `Order Confirmed - #${order.orderId}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #d23669; margin: 0;">Mangalam Florist</h1>
          <p style="color: #666; font-size: 14px;">Expressing through flowers</p>
        </div>
        
        <div style="background-color: #fce4ec; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: #880e4f; margin-top: 0;">Thank you for your order!</h2>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">We've received your order <strong>#${order.orderId}</strong> and we're getting it ready.</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: #880e4f; border-bottom: 2px solid #fce4ec; padding-bottom: 5px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="text-align: left; color: #666; font-size: 14px;">
                <th style="padding: 10px 0;">Item</th>
                <th style="padding: 10px 0; text-align: center;">Qty</th>
                <th style="padding: 10px 0; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0;">
                    ${item.name}${item.isCustom ? ' (Custom)' : ''}
                    ${item.hasPremiumWrapping ? '<br><small style="color: #d23669;">+ Premium Wrapping</small>' : ''}
                    ${item.isCustom && item.custom ? `
                      <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        • Base: ${item.custom.base?.name || 'N/A'}<br>
                        • Paper: ${(item.custom.paper || item.custom.wrapper)?.name || 'N/A'}<br>
                        • Ribbon: ${item.custom.ribbon?.name || 'N/A'}
                        ${item.custom.additions?.length > 0 ? `<br>• Additions: ${item.custom.additions.map(a => `${a.item.name} (x${a.qty})`).join(', ')}` : ''}
                      </div>
                    ` : ''}
                  </td>
                  <td style="padding: 10px 0; text-align: center;">${item.quantity}</td>
                  <td style="padding: 10px 0; text-align: right;">₹${item.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; border-top: 2px solid #fce4ec; padding-top: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Subtotal</span>
              <span>₹${order.subtotal}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Delivery Charge</span>
              <span>₹${order.deliveryCharge}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #d23669; margin-top: 10px;">
              <span>Total Paid</span>
              <span>₹${order.totalAmount}</span>
            </div>
          </div>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h4 style="color: #880e4f; margin-top: 0; margin-bottom: 10px;">Delivery Info</h4>
          <p style="margin: 5px 0;"><strong>Delivering to:</strong> ${order.customerName}</p>
          <p style="margin: 5px 0;"><strong>Address:</strong> ${
            order.address.addressLine1 || order.address.line1
          }, ${
            order.address.landmark || order.address.line2 || ''
          }, ${order.address.city}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${order.deliveryDate ? new Date(order.deliveryDate).toDateString() : 'Today'}</p>
          <p style="margin: 5px 0;"><strong>Slot:</strong> ${order.deliveryTime === 'ASAP' ? 'Standard Delivery (ASAP)' : order.deliveryTime}</p>
        </div>

        <div style="text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
          <p>If you have any questions, reply to this email or call us at support.</p>
          <p>&copy; 2026 Mangalam Florist. All rights reserved.</p>
        </div>
      </div>
    `
  };

  return workTransporter.sendMail(mailOptions);
};

/**
 * Send Support Message Notification to the Support Email
 */
export const sendSupportNotificationToAdmin = async (msg) => {
  const fromEmail = process.env.SUPPORT_EMAIL || 'mangalamflorist.support@gmail.com';
  const mailOptions = {
    from: `"Mangalam Support Alert" <${fromEmail}>`,
    to: fromEmail, // Sending to the same support email
    subject: `New Support Message - ${msg.subject || 'General'}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #d23669; border-bottom: 2px solid #fce4ec; padding-bottom: 10px;">New Support Message</h2>
        <div style="margin: 20px 0;">
          <p><strong>From:</strong> ${msg.name} (<a href="mailto:${msg.email}">${msg.email}</a>)</p>
          <p><strong>Phone:</strong> ${msg.phone}</p>
          <p><strong>Subject:</strong> ${msg.subject || 'General Inquiry'}</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; font-style: italic; margin-top: 10px;">
            "${msg.message}"
          </div>
          <p style="font-size: 12px; color: #999; margin-top: 15px;">Source: ${msg.source || 'Website'}</p>
        </div>
      </div>
    `
  };

  return supportTransporter.sendMail(mailOptions);
};
