
export function getJilaniEmailTemplate(title: string, bodyContent: string) {
  const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/imports/jilanihome_logo.png`;
  const agencyLogoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/agency/neosparkx.jpeg`;

  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 40px 0; -webkit-font-smoothing: antialiased;">
      
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin: 0 auto;">
        
        <tr>
          <td style="padding: 35px 30px; text-align: center; background-color: #ffffff; border-bottom: 2px solid #f1f5f9;">
            <img src="${logoUrl}" alt="Jilani Home Logo" style="width: 50px; height: 50px; border-radius: 12px; margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto;">
            <h1 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Jilani Home</h1>
          </td>
        </tr>

        <tr>
          <td style="padding: 40px 30px; color: #334155; font-size: 16px; line-height: 1.6;">
            ${bodyContent}
          </td>
        </tr>

        <tr>
          <td style="padding: 30px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 20px 0; font-size: 13px; color: #64748b;">© ${currentYear} Jilani Home. All rights reserved.</p>
            
            <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; background-color: #ffffff; padding: 12px 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <tr>
                <td style="padding-right: 15px; vertical-align: middle;">
                  <a href="https://neosparkx.com" target="_blank" style="text-decoration: none;">
                    <img src="${agencyLogoUrl}" alt="NEOSPARKX Logo" style="width: 44px; height: 44px; border-radius: 8px; display: block; border: 1px solid #f1f5f9;">
                  </a>
                </td>
                <td style="text-align: left; vertical-align: middle;">
                  <p style="margin: 0; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Designed & Developed by</p>
                  <p style="margin: 2px 0 0 0;">
                    <a href="https://neosparkx.com" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 800; font-size: 15px; letter-spacing: 0.5px;">NEOSPARKX</a>
                  </p>
                  <p style="margin: 2px 0 0 0;">
                    <a href="mailto:hello@neosparkx.com" style="color: #64748b; text-decoration: none; font-size: 11px; font-weight: 500;">hello@neosparkx.com</a>
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>

      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr><td style="height: 40px;"></td></tr>
      </table>
    </body>
    </html>
  `;
}