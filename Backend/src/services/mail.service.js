const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
})

async function sendMeetingInvite({
  to,
  employeeName,
  title,
  startTime,
  endTime,
  meetLink,
  description,
  visibility,
  departmentName,
}) {
  try {
    const audienceLabel =
      visibility === "PUBLIC"     ? "All Employees"          :
      visibility === "DEPARTMENT" ? `${departmentName} Dept` :
                                    "Selected Employees"

    await transporter.sendMail({
      from:    `"PeopleCore HRMS" <${process.env.SMTP_USER}>`,
      to,
      subject: `:date: Meeting Invite: ${title}`,
      html: `
        <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto;">

          <!-- Header -->
          <div style="background:#2d5a2d; padding:28px 32px; border-radius:10px 10px 0 0;">
            <h2 style="color:#fff; margin:0; font-size:22px;">:date: Meeting Invitation</h2>
            <p style="color:rgba(255,255,255,.75); margin:6px 0 0; font-size:14px;">
              You have a new event on your calendar
            </p>
          </div>

          <!-- Body -->
          <div style="background:#f9f9f7; padding:28px 32px;
                      border:1px solid #E0E0D8; border-top:none;
                      border-radius:0 0 10px 10px;">

            <p style="font-size:15px; color:#333; margin-top:0;">
              Hi <strong>${employeeName}</strong>,
            </p>
            <p style="font-size:14px; color:#555; line-height:1.6;">
              A new meeting has been scheduled for
              <strong>${audienceLabel}</strong>.
            </p>

            <!-- Event Card -->
            <div style="background:#fff; border:1px solid #E0E0D8;
                        border-left:4px solid #2D5A2D; border-radius:8px;
                        padding:20px 24px; margin:20px 0;">

              <h3 style="margin:0 0 16px; font-size:18px; color:#1a1a1a;">
                ${title}
              </h3>

              <table style="width:100%; border-collapse:collapse;
                            font-size:13.5px; color:#444;">
                <tr>
                  <td style="padding:7px 0; width:130px; color:#888; font-weight:600;">
                    :clock1: Start
                  </td>
                  <td style="padding:7px 0;">
                    ${new Date(startTime).toLocaleString("en-IN", {
                      dateStyle: "full", timeStyle: "short",
                    })}
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0; color:#888; font-weight:600;">
                    :clock4: End
                  </td>
                  <td style="padding:7px 0;">
                    ${new Date(endTime).toLocaleString("en-IN", {
                      dateStyle: "full", timeStyle: "short",
                    })}
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0; color:#888; font-weight:600;">
                    :busts_in_silhouette: Audience
                  </td>
                  <td style="padding:7px 0;">${audienceLabel}</td>
                </tr>
                ${description ? `
                <tr>
                  <td style="padding:7px 0; color:#888; font-weight:600;
                             vertical-align:top;">
                    :memo: Note
                  </td>
                  <td style="padding:7px 0;">${description}</td>
                </tr>` : ""}
              </table>

              ${meetLink ? `
              <div style="margin-top:20px;">
                <a href="${meetLink}"
                   style="display:inline-block; padding:11px 24px;
                          background:#2d5a2d; color:#fff;
                          text-decoration:none; border-radius:8px;
                          font-size:14px; font-weight:600;">
                  Join Meeting →
                </a>
              </div>` : ""}
            </div>

            <p style="font-size:12px; color:#aaa; margin-bottom:0;">
              This is an automated notification from PeopleCore HRMS.
              Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    })
    console.log(`[EMAIL] :white_check_mark: Sent to ${to}`)
  } catch (err) {
    // Never throw — email failure must never crash the API
    console.error(`[EMAIL] :x: Failed → ${to}:`, err.message)
  }
}

module.exports = { sendMeetingInvite }