import psycopg2

# Replace with your actual database credentials
dbname = "initial_db"
user = "postgres"
password = "P6ppdnhCmw4nG8kU2a1K"
host = "tunein-db.che0om0o6j54.af-south-1.rds.amazonaws.com"
port = 5432  # Note: Port should be an integer, not a string

try:
    # Establish a connection to the database
    conn = psycopg2.connect(
        dbname=dbname,
        user=user,
        password=password,
        host=host,
        port=port
    )

    # Create a cursor object using the connection
    cursor = conn.cursor()

    # Example query: select all columns from 'users'
    cursor.execute("SELECT * from users;")
    rows = cursor.fetchall()

    # Print each row
    for row in rows:
        # Encode each column before printing
        encoded_row = [str(col).encode('utf-8').decode('unicode_escape') if isinstance(col, str) else col for col in row]
        print(encoded_row)

    # Close communication with the PostgreSQL database server
    cursor.close()

except psycopg2.Error as e:
    print(f"Error connecting to PostgreSQL: {e}")
finally:
    # Close the database connection
    if conn is not None:
        conn.close()
        print("Database connection closed.")
