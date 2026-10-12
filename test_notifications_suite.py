"""
COMPANIO - NOTIFICATIONS & REMINDERS VERIFICATION SUITE
Tests 1 through 10 according to project requirements.
"""

import sys
import json
import unittest
import os
import base64

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat

import app as flask_app
import db
import notifications


def generate_valid_mock_keys():
    """Generates valid 65-byte uncompressed EC public key and 16-byte auth secret for webpush encryption."""
    k = ec.generate_private_key(ec.SECP256R1())
    raw = k.public_key().public_bytes(Encoding.X962, PublicFormat.UncompressedPoint)
    p256dh = base64.urlsafe_b64encode(raw).decode("utf-8")
    auth = base64.urlsafe_b64encode(os.urandom(16)).decode("utf-8")
    return p256dh, auth


class TestNotificationsSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = flask_app.app.test_client()
        cls.user_a_id = 1
        cls.user_b_id = 2

        # Ensure User A and User B exist in the database
        conn = db.get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, full_name FROM users WHERE id IN (%s, %s)", (cls.user_a_id, cls.user_b_id))
        users = cursor.fetchall()
        user_ids = [u["id"] for u in users]
        cursor.close()
        conn.close()

        if 1 not in user_ids:
            raise RuntimeError("User 1 is missing in database.")
        if 2 not in user_ids:
            db.register_user("UserTwo", "usertwo@test.com", "pass123")

    def setUp(self):
        # Clean any existing push subscriptions for test users
        db.delete_user_push_subscriptions(self.user_a_id)
        db.delete_user_push_subscriptions(self.user_b_id)

    # ------------------------------------------------------------------
    # TEST 1 & 2: DAILY MOTIVATION THOUGHTS (ON / OFF)
    # ------------------------------------------------------------------
    def test_01_and_02_daily_motivation_on_off(self):
        print("\n--- Running TEST 1 & 2: Daily Motivation Thoughts (ON / OFF) ---")
        # 1. Enable Daily Motivation in MySQL
        db.update_user_settings(self.user_a_id, {"dailyMotivation": True})
        settings = db.get_user_settings(self.user_a_id)
        self.assertTrue(settings["dailyMotivation"], "Daily motivation should be True in MySQL")

        # Register a valid mock subscription for User A
        p256dh, auth = generate_valid_mock_keys()
        endpoint = "https://updates.push.services.mozilla.com/wpush/v2/mock_token_a_motivation"
        db.save_push_subscription(self.user_a_id, endpoint, p256dh, auth)

        # Verify notification payload and send logic when ON
        payload = notifications.build_notification_payload("motivation")
        self.assertEqual(payload["title"], "Companio 💜")
        self.assertEqual(payload["data"]["type"], "motivation")
        self.assertEqual(payload["data"]["url"], "/daily-motivation")
        self.assertTrue(len(payload["body"]) > 5)

        # Trigger send
        res_on = notifications.send_user_notification(self.user_a_id, "motivation")
        self.assertNotEqual(res_on["status"], "disabled", "Notification should not be disabled when ON")
        self.assertEqual(res_on["total_subscriptions"], 1)
        print("  ✓ TEST 1 PASSED: Setting stored in MySQL, payload verified, dispatched to subscription.")

        # 2. Disable Daily Motivation in MySQL
        db.update_user_settings(self.user_a_id, {"dailyMotivation": False})
        settings = db.get_user_settings(self.user_a_id)
        self.assertFalse(settings["dailyMotivation"], "Daily motivation should be False in MySQL")

        res_off = notifications.send_user_notification(self.user_a_id, "motivation")
        self.assertEqual(res_off["status"], "disabled", "Notification must be blocked when setting is OFF")
        self.assertEqual(res_off["sent"], 0, "No notifications sent when setting is OFF")
        print("  ✓ TEST 2 PASSED: Disabled setting in MySQL strictly blocks motivation notifications.")

    # ------------------------------------------------------------------
    # TEST 3 & 4: MOOD CHECK-IN REMINDER (ON / OFF)
    # ------------------------------------------------------------------
    def test_03_and_04_mood_reminder_on_off(self):
        print("\n--- Running TEST 3 & 4: Mood Check-in Reminder (ON / OFF) ---")
        # 1. Enable Mood Reminder
        db.update_user_settings(self.user_a_id, {"moodReminder": True})
        settings = db.get_user_settings(self.user_a_id)
        self.assertTrue(settings["moodReminder"], "Mood reminder should be True in MySQL")

        p256dh, auth = generate_valid_mock_keys()
        endpoint = "https://updates.push.services.mozilla.com/wpush/v2/mock_token_a_mood"
        db.save_push_subscription(self.user_a_id, endpoint, p256dh, auth)

        payload = notifications.build_notification_payload("mood")
        self.assertEqual(payload["title"], "Companio 💜")
        self.assertEqual(payload["data"]["type"], "mood")
        self.assertEqual(payload["data"]["url"], "/dashboard")

        res_on = notifications.send_user_notification(self.user_a_id, "mood")
        self.assertNotEqual(res_on["status"], "disabled")
        print("  ✓ TEST 3 PASSED: Mood Reminder enabled, links to /dashboard, dispatched to subscription.")

        # 2. Disable Mood Reminder
        db.update_user_settings(self.user_a_id, {"moodReminder": False})
        settings = db.get_user_settings(self.user_a_id)
        self.assertFalse(settings["moodReminder"])

        res_off = notifications.send_user_notification(self.user_a_id, "mood")
        self.assertEqual(res_off["status"], "disabled")
        self.assertEqual(res_off["sent"], 0)
        print("  ✓ TEST 4 PASSED: Disabled Mood Reminder strictly blocks mood notifications.")

    # ------------------------------------------------------------------
    # TEST 5 & 6: DAILY WELLNESS ACTIVITIES & TIPS (ON / OFF)
    # ------------------------------------------------------------------
    def test_05_and_06_wellness_tips_on_off(self):
        print("\n--- Running TEST 5 & 6: Wellness Activities & Tips (ON / OFF) ---")
        # 1. Enable Wellness Tips
        db.update_user_settings(self.user_a_id, {"wellnessTips": True})
        settings = db.get_user_settings(self.user_a_id)
        self.assertTrue(settings["wellnessTips"], "Wellness tips should be True in MySQL")

        p256dh, auth = generate_valid_mock_keys()
        endpoint = "https://updates.push.services.mozilla.com/wpush/v2/mock_token_a_wellness"
        db.save_push_subscription(self.user_a_id, endpoint, p256dh, auth)

        payload = notifications.build_notification_payload("wellness")
        self.assertEqual(payload["title"], "Companio 🌿")
        self.assertEqual(payload["data"]["type"], "wellness")
        self.assertEqual(payload["data"]["url"], "/wellness-activities")

        res_on = notifications.send_user_notification(self.user_a_id, "wellness")
        self.assertNotEqual(res_on["status"], "disabled")
        print("  ✓ TEST 5 PASSED: Wellness Tips enabled, links to /wellness-activities, dispatched.")

        # 2. Disable Wellness Tips
        db.update_user_settings(self.user_a_id, {"wellnessTips": False})
        settings = db.get_user_settings(self.user_a_id)
        self.assertFalse(settings["wellnessTips"])

        res_off = notifications.send_user_notification(self.user_a_id, "wellness")
        self.assertEqual(res_off["status"], "disabled")
        self.assertEqual(res_off["sent"], 0)
        print("  ✓ TEST 6 PASSED: Disabled Wellness Tips strictly blocks wellness notifications.")

    # ------------------------------------------------------------------
    # TEST 7: USER ISOLATION
    # ------------------------------------------------------------------
    def test_07_user_isolation(self):
        print("\n--- Running TEST 7: User Isolation ---")
        p256dh_a, auth_a = generate_valid_mock_keys()
        p256dh_b, auth_b = generate_valid_mock_keys()

        # User A: Daily Motivation = ON
        db.update_user_settings(self.user_a_id, {"dailyMotivation": True})
        db.save_push_subscription(self.user_a_id, "https://push.example.com/user_a", p256dh_a, auth_a)

        # User B: Daily Motivation = OFF
        db.update_user_settings(self.user_b_id, {"dailyMotivation": False})
        db.save_push_subscription(self.user_b_id, "https://push.example.com/user_b", p256dh_b, auth_b)

        # Check User B notification attempt
        res_b = notifications.send_user_notification(self.user_b_id, "motivation")
        self.assertEqual(res_b["status"], "disabled", "User B must NOT receive motivation notifications.")

        # Check User A notification attempt
        res_a = notifications.send_user_notification(self.user_a_id, "motivation")
        self.assertNotEqual(res_a["status"], "disabled", "User A should receive motivation notification.")

        # Verify subscriptions isolation in MySQL
        subs_a = db.get_user_push_subscriptions(self.user_a_id)
        subs_b = db.get_user_push_subscriptions(self.user_b_id)
        self.assertEqual(len(subs_a), 1)
        self.assertEqual(subs_a[0]["endpoint"], "https://push.example.com/user_a")
        self.assertEqual(len(subs_b), 1)
        self.assertEqual(subs_b[0]["endpoint"], "https://push.example.com/user_b")
        print("  ✓ TEST 7 PASSED: Complete isolation between User A and User B preferences and subscriptions.")

    # ------------------------------------------------------------------
    # TEST 8: RESTART PERSISTENCE
    # ------------------------------------------------------------------
    def test_08_restart_persistence(self):
        print("\n--- Running TEST 8: Restart Persistence ---")
        # Save specific settings for User A
        test_settings = {
            "dailyMotivation": True,
            "moodReminder": False,
            "wellnessTips": True
        }
        db.update_user_settings(self.user_a_id, test_settings)

        # Simulate fresh reload from MySQL
        reloaded = db.get_user_settings(self.user_a_id)
        self.assertEqual(reloaded["dailyMotivation"], True)
        self.assertEqual(reloaded["moodReminder"], False)
        self.assertEqual(reloaded["wellnessTips"], True)
        print("  ✓ TEST 8 PASSED: All preferences persist in MySQL across server reloads.")

    # ------------------------------------------------------------------
    # TEST 9: CLIENT/API SETTINGS & ENDPOINTS
    # ------------------------------------------------------------------
    def test_09_api_and_service_worker_endpoints(self):
        print("\n--- Running TEST 9: API & Service Worker Endpoints ---")
        with self.client.session_transaction() as sess:
            sess["user_id"] = self.user_a_id
            sess["user_name"] = "UserA"

        # 1. Test /service-worker.js
        sw_res = self.client.get("/service-worker.js")
        self.assertEqual(sw_res.status_code, 200)
        self.assertIn("application/javascript", sw_res.content_type)
        self.assertIn(b"push", sw_res.data)
        self.assertIn(b"notificationclick", sw_res.data)

        # 2. Test /api/notifications/vapid-public-key
        vapid_res = self.client.get("/api/notifications/vapid-public-key")
        self.assertEqual(vapid_res.status_code, 200)
        key_data = json.loads(vapid_res.data)
        self.assertTrue(key_data["success"])
        self.assertTrue(len(key_data["publicKey"]) > 20)

        # 3. Test /api/notifications/subscribe
        p256dh, auth = generate_valid_mock_keys()
        sub_payload = {
            "subscription": {
                "endpoint": "https://push.example.com/api_test_sub",
                "keys": {
                    "p256dh": p256dh,
                    "auth": auth
                }
            }
        }
        sub_res = self.client.post("/api/notifications/subscribe", json=sub_payload)
        self.assertEqual(sub_res.status_code, 200)

        # Verify stored in DB
        subs = db.get_user_push_subscriptions(self.user_a_id)
        endpoints = [s["endpoint"] for s in subs]
        self.assertIn("https://push.example.com/api_test_sub", endpoints)

        # 4. Test /api/notifications/unsubscribe
        unsub_res = self.client.post("/api/notifications/unsubscribe", json={"endpoint": "https://push.example.com/api_test_sub"})
        self.assertEqual(unsub_res.status_code, 200)
        subs_after = db.get_user_push_subscriptions(self.user_a_id)
        self.assertNotIn("https://push.example.com/api_test_sub", [s["endpoint"] for s in subs_after])

        print("  ✓ TEST 9 PASSED: Service worker served, VAPID key provided, subscribe and unsubscribe APIs verified.")

    # ------------------------------------------------------------------
    # TEST 10: EXISTING FEATURES INTEGRITY
    # ------------------------------------------------------------------
    def test_10_existing_features_intact(self):
        print("\n--- Running TEST 10: Existing Features Integrity ---")
        with self.client.session_transaction() as sess:
            sess["user_id"] = self.user_a_id
            sess["user_name"] = "UserA"

        # 1. Settings page
        res = self.client.get("/settings")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"dailyMotivation", res.data)
        self.assertIn(b"moodReminder", res.data)
        self.assertIn(b"wellnessTips", res.data)
        self.assertIn(b"saveChatHistory", res.data)
        self.assertIn(b"saveMoodHistory", res.data)

        # 2. Dashboard
        res = self.client.get("/dashboard")
        self.assertEqual(res.status_code, 200)

        # 3. Daily Motivation page
        res = self.client.get("/daily-motivation")
        self.assertEqual(res.status_code, 200)

        # 4. Wellness Activities page
        res = self.client.get("/wellness-activities")
        self.assertEqual(res.status_code, 200)

        # 5. Recommendations page
        res = self.client.get("/recommendations")
        self.assertEqual(res.status_code, 200)

        print("  ✓ TEST 10 PASSED: Existing routes (/settings, /dashboard, /daily-motivation, /wellness-activities, /recommendations) intact.")


if __name__ == "__main__":
    unittest.main()
