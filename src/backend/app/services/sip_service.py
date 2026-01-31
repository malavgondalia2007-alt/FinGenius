def get_monthly_investable_amount(profile):
    # Student
    if profile.type.value == "student":
        if not profile.weekly_pocket_money:
            return 0
        return profile.weekly_pocket_money * 4

    # Employee
    income = profile.monthly_income or 0
    fixed = sum(profile.fixed_expenses.values()) if profile.fixed_expenses else 0
    loans = sum(profile.loans.values()) if profile.loans else 0
    sip = profile.sip_commitments or 0

    return max(income - fixed - loans - sip, 0)


def suggest_sips(profile, sip_schemes):
    investable = get_monthly_investable_amount(profile)

    min_limit = investable * 0.10
    max_limit = investable * 0.30

    recommendations = []

    for sip in sip_schemes:
        if (
            sip.suitable_for == profile.type
            and sip.min_amount <= max_limit
            and sip.max_amount >= min_limit
        ):
            recommendations.append({
                "sip_name": sip.name,
                "risk_level": sip.risk_level.value,
                "recommended_amount": round(min_limit),
                "description": sip.description
            })

    return recommendations
