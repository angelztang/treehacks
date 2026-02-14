import requests
import webbrowser
import time
from app import create_app
from app.models import User
from app.cas.auth import CAS_SERVER, CAS_SERVICE, validate_cas_ticket
from app.extensions import db

def test_auth_flow():
    """Test the CAS authentication flow."""
    print("Starting CAS authentication test...")
    
    # Create Flask app context
    app = create_app()
    with app.app_context():
        # Construct CAS login URL
        service_url = f"{CAS_SERVICE}/api/cas/login"
        login_url = f"{CAS_SERVER}/login?service={service_url}"
        
        print(f"\nOpening CAS login URL in browser: {login_url}")
        webbrowser.open(login_url)
        
        # Wait for user to log in and get ticket
        print("\nPlease log in through CAS in your browser.")
        print("After logging in, you will be redirected. Copy the 'ticket' parameter from the URL.")
        ticket = input("\nEnter the ticket from the URL: ").strip()
        
        if not ticket:
            print("No ticket provided. Test failed.")
            return
        
        print(f"\nValidating ticket: {ticket}")
        netid = validate_cas_ticket(ticket, service_url)
        
        if not netid:
            print("Ticket validation failed.")
            return
        
        print(f"\nTicket validated successfully for netid: {netid}")
        
        # Check if user exists in database
        user = User.query.filter_by(netid=netid).first()
        if user:
            print(f"\nUser found in database: {user.netid}")
        else:
            print("\nUser not found in database. This is unexpected.")
            
if __name__ == "__main__":
    test_auth_flow() 