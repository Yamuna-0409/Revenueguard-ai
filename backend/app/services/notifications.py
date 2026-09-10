def send_customer_notification(customer_id, message):

    print(f"Notification sent to {customer_id}: {message}")

    return {
        "status": "sent",
        "customer_id": customer_id,
        "message": message
    }