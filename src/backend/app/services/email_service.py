import os
import ssl
import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from ..models import EmailVerification

GMAIL_USER = os.getenv("GMAIL_USER", "")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "")
CODE_EXPIRY_MINUTES = 15


def generate_code(length: int = 6) -> str:
    """Genera un código numérico aleatorio de 6 dígitos."""
    return "".join(random.choices(string.digits, k=length))


def send_verification_email(to_email: str, user_name: str, code: str) -> bool:
    """
    Envía el correo de verificación con el código de 6 dígitos.
    Retorna True si fue enviado correctamente, False si hubo error.
    """
    subject = "🔐 Tu código de verificación — ChronoHub"

    html_body = f"""
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:16px;overflow:hidden;border:1px solid #2d2d4e;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6a11cb 0%,#2575fc 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                ⏱ ChronoHub
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
                Verificación de cuenta
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 12px;color:#e0e0f0;font-size:16px;">
                Hola, <strong style="color:#ffffff;">{user_name}</strong> 👋
              </p>
              <p style="margin:0 0 28px;color:#9090b0;font-size:14px;line-height:1.6;">
                Gracias por registrarte en ChronoHub. Usa el código a continuación para verificar tu correo electrónico. El código es válido por <strong style="color:#e0e0f0;">{CODE_EXPIRY_MINUTES} minutos</strong>.
              </p>
              <!-- Code Box -->
              <div style="background:#12122a;border:2px solid #6a11cb;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 8px;color:#9090b0;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Tu código de verificación</p>
                <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:14px;color:#ffffff;font-family:monospace;">
                  {code}
                </p>
              </div>
              <p style="margin:0;color:#6060a0;font-size:12px;line-height:1.6;">
                Si no creaste una cuenta en ChronoHub, puedes ignorar este correo de forma segura.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#12122a;padding:20px 40px;text-align:center;border-top:1px solid #2d2d4e;">
              <p style="margin:0;color:#4040a0;font-size:12px;">
                © 2026 ChronoHub — No respondas a este correo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"ChronoHub <{GMAIL_USER}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    print(f"[EMAIL INFO] Intentando enviar correo a {to_email}...", flush=True)

    # Si no se configuraron credenciales, simular envío imprimiendo en consola
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        print("\n" + "="*80, flush=True)
        print(f" [DESARROLLO] GMAIL_USER o GMAIL_APP_PASSWORD no están configurados en .env", flush=True)
        print(f" [DESARROLLO] Código de verificación para {user_name} ({to_email}):", flush=True)
        print(f" >>> {code} <<<", flush=True)
        print("="*80 + "\n", flush=True)
        return True

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())
        print(f"[EMAIL INFO] Correo enviado exitosamente a {to_email}.", flush=True)
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] No se pudo enviar el correo a {to_email}: {e}", flush=True)
        print("\n" + "="*80, flush=True)
        print(f" [FALLO DE ENVÍO] No se pudo conectar con el servidor de correo.", flush=True)
        print(f" [DESARROLLO] Código de verificación para {user_name} ({to_email}):", flush=True)
        print(f" >>> {code} <<<", flush=True)
        print("="*80 + "\n", flush=True)
        return False



def create_verification_code(db: Session, user_id) -> str:
    """
    Genera un código, invalida los anteriores y lo guarda en la base de datos.
    Retorna el código generado.
    """
    # Invalidar códigos anteriores del mismo usuario
    existing = db.query(EmailVerification).filter(
        EmailVerification.user_id == user_id,
        EmailVerification.used == False
    ).all()
    for ev in existing:
        ev.used = True

    code = generate_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=CODE_EXPIRY_MINUTES)

    verification = EmailVerification(
        user_id=user_id,
        code=code,
        expires_at=expires_at,
        used=False
    )
    db.add(verification)
    db.commit()
    return code


def verify_code(db: Session, user_id, code: str) -> bool:
    """
    Verifica si el código es válido y no ha expirado.
    Marca el código como usado si es correcto.
    Retorna True si válido, False si no.
    """
    now = datetime.now(timezone.utc)
    record = db.query(EmailVerification).filter(
        EmailVerification.user_id == user_id,
        EmailVerification.code == code,
        EmailVerification.used == False,
        EmailVerification.expires_at > now
    ).first()

    if not record:
        return False

    record.used = True
    db.commit()
    return True
