from ..core.database import SessionLocal
from ..models.models import SIPScheme, ProfileType, RiskLevel

def seed_sip_schemes():
    db = SessionLocal()

    # prevent duplicate seeding
    if db.query(SIPScheme).first():
        db.close()
        return

    sips = [
        SIPScheme(
            name="Index Fund SIP",
            min_amount=500,
            max_amount=3000,
            suitable_for=ProfileType.STUDENT,
            risk_level=RiskLevel.LOW,
            description="Low-risk SIP suitable for students and beginners"
        ),
        SIPScheme(
            name="Large Cap SIP",
            min_amount=2000,
            max_amount=20000,
            suitable_for=ProfileType.EMPLOYEE,
            risk_level=RiskLevel.MODERATE,
            description="Stable long-term investment for salaried users"
        ),
        SIPScheme(
            name="ELSS Tax Saver SIP",
            min_amount=3000,
            max_amount=15000,
            suitable_for=ProfileType.EMPLOYEE,
            risk_level=RiskLevel.MODERATE,
            description="Tax-saving SIP under Section 80C"
        ),
    ]

    db.add_all(sips)
    db.commit()
    db.close()
