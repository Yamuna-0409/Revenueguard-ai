import sqlite3
from pathlib import Path


# =========================================================
# DATABASE PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "revenueguard.db"


# =========================================================
# CONNECT DATABASE
# =========================================================

connection = sqlite3.connect(DB_PATH)
cursor = connection.cursor()


print("Connected to database:")
print(DB_PATH)
print()


# =========================================================
# FUNCTION TO GET EXISTING COLUMNS
# =========================================================

def get_columns(table_name):

    cursor.execute(
        f"PRAGMA table_info({table_name})"
    )

    rows = cursor.fetchall()

    return {
        row[1]
        for row in rows
    }


# =========================================================
# ADD MISSING COLUMN
# =========================================================

def add_column_if_missing(
    table_name,
    column_name,
    column_definition
):

    columns = get_columns(table_name)

    if column_name not in columns:

        cursor.execute(
            f"""
            ALTER TABLE {table_name}
            ADD COLUMN {column_name}
            {column_definition}
            """
        )

        print(
            f"Added: {table_name}.{column_name}"
        )

    else:

        print(
            f"Exists: {table_name}.{column_name}"
        )


# =========================================================
# RECOVERY ACTIONS TABLE
# =========================================================

print("Checking recovery_actions table...")

recovery_columns = get_columns(
    "recovery_actions"
)

if not recovery_columns:

    print(
        "recovery_actions table not found."
    )

else:

    add_column_if_missing(
        "recovery_actions",
        "payment_id",
        "INTEGER"
    )

    add_column_if_missing(
        "recovery_actions",
        "event_id",
        "VARCHAR"
    )

    add_column_if_missing(
        "recovery_actions",
        "risk_level",
        "VARCHAR"
    )

    add_column_if_missing(
        "recovery_actions",
        "action",
        "VARCHAR"
    )

    add_column_if_missing(
        "recovery_actions",
        "priority",
        "VARCHAR"
    )

    add_column_if_missing(
        "recovery_actions",
        "message",
        "VARCHAR"
    )

    add_column_if_missing(
        "recovery_actions",
        "recovered_amount",
        "FLOAT DEFAULT 0"
    )

    add_column_if_missing(
        "recovery_actions",
        "status",
        "VARCHAR"
    )

    add_column_if_missing(
        "recovery_actions",
        "created_at",
        "DATETIME"
    )


# =========================================================
# AUDIT LOGS TABLE
# =========================================================

print()
print("Checking audit_logs table...")

audit_columns = get_columns(
    "audit_logs"
)

if not audit_columns:

    print(
        "audit_logs table not found."
    )

else:

    add_column_if_missing(
        "audit_logs",
        "payment_id",
        "INTEGER"
    )

    add_column_if_missing(
        "audit_logs",
        "event_id",
        "VARCHAR"
    )

    add_column_if_missing(
        "audit_logs",
        "amount",
        "FLOAT DEFAULT 0"
    )

    add_column_if_missing(
        "audit_logs",
        "action",
        "VARCHAR"
    )

    add_column_if_missing(
        "audit_logs",
        "priority",
        "VARCHAR"
    )

    add_column_if_missing(
        "audit_logs",
        "status",
        "VARCHAR"
    )

    add_column_if_missing(
        "audit_logs",
        "message",
        "VARCHAR"
    )

    add_column_if_missing(
        "audit_logs",
        "created_at",
        "DATETIME"
    )


# =========================================================
# SAVE CHANGES
# =========================================================

connection.commit()

connection.close()


print()
print("====================================")
print("DATABASE MIGRATION COMPLETED")
print("Existing data was NOT deleted.")
print("====================================")