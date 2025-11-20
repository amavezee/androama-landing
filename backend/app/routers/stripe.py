"""
Stripe Payment Integration (Test Mode)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.auth import get_current_active_user
from app.models import User
from dotenv import load_dotenv
import stripe
import os

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/api/stripe", tags=["stripe"])

# Initialize Stripe with test key from environment
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_51QEXAMPLE")

class PaymentIntentRequest(BaseModel):
    amount: int  # Amount in cents
    description: str

@router.post("/create-payment-intent")
async def create_payment_intent(
    request: PaymentIntentRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe payment intent (test mode)"""
    try:
        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=request.amount,
            currency="usd",
            description=request.description,
            metadata={
                "user_id": str(current_user.id),
                "user_email": current_user.email,
            },
        )
        
        return {
            "client_secret": intent.client_secret,
            "amount": intent.amount,
            "currency": intent.currency,
        }
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment intent: {str(e)}"
        )

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events (for subscription management)"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        # Update user subscription here
        # For now, just log it
        print(f"Payment succeeded: {payment_intent['id']}")
    
    return {"status": "success"}

