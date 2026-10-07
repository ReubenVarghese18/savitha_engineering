import logging
import os
import smtplib
from email.message import EmailMessage

logger = logging.getLogger("notifications")


def _one_line(value: str, limit: int = 120) -> str:
    return " ".join(str(value).split())[:limit]


def send_quote_alert(quote: dict) -> None:
    """Email the sales team about a new quote request. Never raises."""
    host = os.getenv("SMTP_HOST")
    recipients = [r.strip() for r in os.getenv("QUOTE_ALERT_TO", "").split(",") if r.strip()]
    if not host or not recipients:
        logger.info("Quote alert skipped: SMTP_HOST or QUOTE_ALERT_TO not configured")
        return

    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    sender = os.getenv("SMTP_FROM") or user or "alerts@localhost"

    msg = EmailMessage()
    msg["Subject"] = f"New quote request #{quote['id']} from {_one_line(quote['company'], 60)}"
    msg["From"] = sender
    msg["To"] = ", ".join(recipients)
    assets = ", ".join(quote.get("requested_assets") or []) or "none selected"
    msg.set_content(
        f"A new quote request was submitted on the website.\n\n"
        f"Quote ID: {quote['id']}\n"
        f"Name: {_one_line(quote['full_name'])}\n"
        f"Company: {_one_line(quote['company'])}\n"
        f"Category: {_one_line(quote['category'])}\n"
        f"Products: {assets}\n"
        f"Custom request: {'yes' if quote.get('is_custom_request') else 'no'}\n\n"
        f"Requirement details:\n{quote['requirement_details']}\n\n"
        f"Open the admin dashboard to review and respond."
    )

    try:
        with smtplib.SMTP(host, port, timeout=15) as smtp:
            if os.getenv("SMTP_STARTTLS", "true").lower() == "true":
                smtp.starttls()
            if user and password:
                smtp.login(user, password)
            smtp.send_message(msg)
        logger.info("Quote alert sent for quote %s", quote["id"])
    except Exception:
        logger.exception("Failed to send quote alert for quote %s", quote.get("id"))
