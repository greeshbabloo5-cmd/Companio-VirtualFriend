"""
Companio - Notification & Reminder System
Provides Web Push notifications, VAPID management, and background scheduling.
"""

import os
import json
import random
import logging
from py_vapid import Vapid
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
import base64
from pywebpush import webpush, WebPushException
from apscheduler.schedulers.background import BackgroundScheduler
import db

logger = logging.getLogger("companio.notifications")
logging.basicConfig(level=logging.INFO)

VAPID_PEM_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".vapid_private.pem")

# Global cached VAPID instance and scheduler
_vapid_instance = None
_scheduler = None

# Curated motivational thoughts consistent with Companio's motivation system
MOTIVATION_THOUGHTS = [
    "You are allowed to believe in yourself before everyone else does. 💜",
    "Your progress does not need to look like anyone else's. 💜",
    "You have already handled moments you once thought you couldn't. 💜",
    "One gentle step forward is still meaningful progress. 💜",
    "You don't need to have everything figured out right now. 💜",
    "Give yourself credit for how hard you are trying today. 💜",
    "Peace begins the moment you choose not to allow events to control your emotions. 💜",
    "You are stronger than the doubts whispering in your head. 💜",
    "Breathe. You are right where you need to be. 💜",
    "Small steps every day lead to big changes. You've got this! 💜"
]

MOOD_REMINDERS = [
    "How are you feeling today? 💜 Take a moment to check in with yourself.",
    "Pause for a gentle breath: How is your heart feeling right now? 💜",
    "A gentle reminder to pause, reflect, and check in on your mood. 💜"
]

WELLNESS_TIPS = [
    "Your wellness moment is here 🌿 Take a few minutes for a breathing exercise.",
    "Time for a mindful break 🌿 Stretch, drink some water, and relax your shoulders.",
    "A peaceful moment for you 🌿 Try a gentle mindful pause to reset your mind.",
    "Wellness check-in 🌿 Give your mind and body a calm moment today."
]


def get_vapid():
    """
    Returns an initialized Vapid instance, loading from environment,
    cached pem file, or generating a new keypair if needed.
    """
    global _vapid_instance
    if _vapid_instance is not None:
        return _vapid_instance

    env_priv = os.environ.get("VAPID_PRIVATE_KEY")
    if env_priv:
        if os.path.isfile(env_priv):
            try:
                _vapid_instance = Vapid.from_file(private_key_file=env_priv)
                return _vapid_instance
            except Exception as e:
                logger.warning("Failed loading VAPID from file in env: %s", e)
        try:
            _vapid_instance = Vapid.from_string(private_key=env_priv)
            return _vapid_instance
        except Exception as e:
            logger.warning("Failed loading VAPID from raw string in env: %s", e)

    if os.path.isfile(VAPID_PEM_FILE):
        try:
            _vapid_instance = Vapid.from_file(private_key_file=VAPID_PEM_FILE)
            return _vapid_instance
        except Exception as e:
            logger.warning("Failed loading VAPID from %s: %s", VAPID_PEM_FILE, e)

    # Generate new VAPID keypair and persist PEM
    v = Vapid()
    v.generate_keys()
    try:
        with open(VAPID_PEM_FILE, "wb") as f:
            f.write(v.private_pem())
    except Exception as e:
        logger.warning("Failed persisting VAPID PEM to %s: %s", VAPID_PEM_FILE, e)

    _vapid_instance = v
    return _vapid_instance


def get_vapid_public_key():
    """
    Returns the URL-safe base64 uncompressed public key string for PushManager.
    """
    v = get_vapid()
    raw_pub = v.public_key.public_bytes(Encoding.X962, PublicFormat.UncompressedPoint)
    return base64.urlsafe_b64encode(raw_pub).rstrip(b"=").decode("utf-8")


def send_push(subscription, payload):
    """
    Send a push notification payload to a single subscription dictionary.
    subscription: dict with keys 'endpoint', 'p256dh', 'auth'
    payload: dict with title, body, icon, url, tag, etc.
    """
    v = get_vapid()
    sub_info = {
        "endpoint": subscription["endpoint"],
        "keys": {
            "p256dh": subscription["p256dh"],
            "auth": subscription["auth"]
        }
    }

    claim_email = os.environ.get("VAPID_CLAIM_EMAIL", "mailto:support@companio.local")
    claims = {"sub": claim_email}

    try:
        webpush(
            subscription_info=sub_info,
            data=json.dumps(payload),
            vapid_private_key=v,
            vapid_claims=claims,
            ttl=3600
        )
        return True, "Delivered"
    except WebPushException as ex:
        status_code = getattr(getattr(ex, "response", None), "status_code", None)
        logger.warning("WebPushException (status=%s): %s", status_code, ex)
        # If subscription is gone or expired (404/410), delete it from MySQL
        if status_code in (404, 410):
            logger.info("Removing expired push subscription: %s", subscription.get("endpoint"))
            db.delete_push_subscription(subscription["endpoint"])
        return False, f"WebPushException: {ex}"
    except Exception as e:
        logger.error("Error sending push notification: %s", e)
        return False, str(e)


def build_notification_payload(notification_type):
    """
    Build title, body, url, and tag for the specified notification type.
    Supported types: 'motivation', 'mood', 'wellness'
    """
    if notification_type == "motivation":
        thought = random.choice(MOTIVATION_THOUGHTS)
        return {
            "title": "Companio 💜",
            "body": thought,
            "icon": "/static/images/logo.png",
            "badge": "/static/images/logo.png",
            "data": {
                "url": "/daily-motivation",
                "type": "motivation"
            },
            "tag": "companio-motivation"
        }
    elif notification_type == "mood":
        reminder = random.choice(MOOD_REMINDERS)
        return {
            "title": "Companio 💜",
            "body": reminder,
            "icon": "/static/images/logo.png",
            "badge": "/static/images/logo.png",
            "data": {
                "url": "/dashboard",
                "type": "mood"
            },
            "tag": "companio-mood"
        }
    elif notification_type == "wellness":
        tip = random.choice(WELLNESS_TIPS)
        return {
            "title": "Companio 🌿",
            "body": tip,
            "icon": "/static/images/logo.png",
            "badge": "/static/images/logo.png",
            "data": {
                "url": "/wellness-activities",
                "type": "wellness"
            },
            "tag": "companio-wellness"
        }
    else:
        return {
            "title": "Companio 💜",
            "body": "A gentle reminder from Companio.",
            "icon": "/static/images/logo.png",
            "badge": "/static/images/logo.png",
            "data": {
                "url": "/dashboard",
                "type": "general"
            },
            "tag": "companio-general"
        }


def send_user_notification(user_id, notification_type):
    """
    Sends a push notification to user_id IF the corresponding MySQL setting is enabled.
    Returns dict with summary: sent_count, skipped (if disabled), etc.
    """
    settings = db.get_user_settings(user_id)

    # Check permission per notification type
    if notification_type == "motivation" and not settings.get("dailyMotivation", True):
        return {"sent": 0, "status": "disabled", "reason": "Daily Motivation is turned OFF in user settings"}

    if notification_type == "mood" and not settings.get("moodReminder", False):
        return {"sent": 0, "status": "disabled", "reason": "Mood Check-in Reminder is turned OFF in user settings"}

    if notification_type == "wellness" and not settings.get("wellnessTips", True):
        return {"sent": 0, "status": "disabled", "reason": "Wellness Activities & Tips is turned OFF in user settings"}

    subscriptions = db.get_user_push_subscriptions(user_id)
    if not subscriptions:
        return {"sent": 0, "status": "no_subscriptions", "reason": "No push subscriptions registered for this user"}

    payload = build_notification_payload(notification_type)
    sent_count = 0
    results = []

    for sub in subscriptions:
        success, message = send_push(sub, payload)
        results.append({"id": sub["id"], "success": success, "message": message})
        if success:
            sent_count += 1

    return {
        "sent": sent_count,
        "total_subscriptions": len(subscriptions),
        "status": "delivered" if sent_count > 0 else "failed",
        "payload": payload,
        "details": results
    }


def broadcast_scheduled_notification(notification_type):
    """
    Background job: iterate through all active users and dispatch notification
    if their MySQL setting permits it.
    """
    try:
        active_users = db.get_all_active_users_for_notifications()
        logger.info("Running scheduled notification '%s' for %d active user(s)", notification_type, len(active_users))
        for u in active_users:
            user_id = u["id"]
            if notification_type == "motivation" and not u.get("daily_motivation", 1):
                continue
            if notification_type == "mood" and not u.get("mood_reminder", 0):
                continue
            if notification_type == "wellness" and not u.get("wellness_tips", 1):
                continue

            send_user_notification(user_id, notification_type)
    except Exception as e:
        logger.error("Error in broadcast_scheduled_notification(%s): %s", notification_type, e)


def init_scheduler(app):
    """
    Safely initialize APScheduler in the background.
    Guarded against duplicate instances during Werkzeug debug reload.
    If initialization fails, the Flask app continues running unaffected.
    """
    global _scheduler
    try:
        # Avoid running duplicate schedulers in Flask debug mode
        if app.debug and os.environ.get("WERKZEUG_RUN_MAIN") != "true":
            logger.info("Skipping scheduler in primary Werkzeug process; will run in reloader child.")
            return None

        if _scheduler is not None and _scheduler.running:
            logger.info("Scheduler is already running.")
            return _scheduler

        _scheduler = BackgroundScheduler(daemon=True)

        # Schedule daily notifications:
        # Motivation every day at 09:00
        _scheduler.add_job(
            broadcast_scheduled_notification,
            trigger="cron",
            hour=9,
            minute=0,
            args=["motivation"],
            id="daily_motivation_job",
            replace_existing=True
        )

        # Mood reminder every day at 14:00
        _scheduler.add_job(
            broadcast_scheduled_notification,
            trigger="cron",
            hour=14,
            minute=0,
            args=["mood"],
            id="mood_reminder_job",
            replace_existing=True
        )

        # Wellness tip every day at 19:00
        _scheduler.add_job(
            broadcast_scheduled_notification,
            trigger="cron",
            hour=19,
            minute=0,
            args=["wellness"],
            id="wellness_tips_job",
            replace_existing=True
        )

        _scheduler.start()
        logger.info("Notification BackgroundScheduler started successfully.")
        return _scheduler
    except Exception as e:
        logger.error("Failed to initialize background scheduler: %s. Flask app will continue normally.", e)
        return None
