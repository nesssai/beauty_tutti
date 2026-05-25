import uuid
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from server.auth_utils import hash_password
from server.models import (
    Booking,
    Client,
    Master,
    MasterBlockedInterval,
    MasterService,
    Salon,
    Service,
)


def seed_if_empty(db: Session) -> None:
    if db.query(Service).first():
        return

    services = [
        ("svc_mani", "Маникюр классический", 90, 1800),
        ("svc_pedi", "Педикюр SPA", 120, 2600),
        ("svc_cut", "Стрижка", 60, 1400),
        ("svc_color", "Окрашивание", 150, 5200),
        ("svc_brow", "Коррекция бровей", 45, 900),
    ]
    for sid, name, dur, price in services:
        db.add(Service(id=sid, name=name, duration_minutes=dur, price_rub=price))

    salons = [
        ("sal_center", "BEAUTY TUTTI Центр", "ул. Ленина, 12", "Новосибирск"),
        ("sal_south", "BEAUTY TUTTI Юг", "ул. Красный пр., 88", "Новосибирск"),
    ]
    for sid, name, addr, city in salons:
        db.add(Salon(id=sid, name=name, address=addr, city=city))

    masters_data = [
        ("m_anna", "Анна", "sal_center", "anna", "anna2026", ["svc_mani", "svc_pedi", "svc_brow"]),
        ("m_irina", "Ирина", "sal_center", "irina", "irina2026", ["svc_cut", "svc_color"]),
        ("m_olga", "Ольга", "sal_south", "olga", "olga2026", ["svc_mani", "svc_cut", "svc_brow"]),
        ("m_kate", "Екатерина", "sal_south", "kate", "kate2026", ["svc_pedi", "svc_color"]),
    ]
    for mid, name, salon_id, login, pwd, svc_ids in masters_data:
        db.add(
            Master(
                id=mid,
                name=name,
                salon_id=salon_id,
                login=login,
                password_hash=hash_password(pwd),
            )
        )
        for svc_id in svc_ids:
            db.add(MasterService(master_id=mid, service_id=svc_id))

    db.add(
        Client(
            id="u_maria",
            name="Мария Иванова",
            email="maria@example.com",
            phone="+79001112233",
            password_hash=hash_password("demo"),
            first_visit_discount_used=False,
        )
    )

    now = datetime.now().replace(second=0, microsecond=0)
    d1 = (now + timedelta(days=1)).replace(hour=10, minute=0)
    d1_end = d1 + timedelta(minutes=90)
    d1b = (now + timedelta(days=1)).replace(hour=14, minute=0)
    d1b_end = d1b + timedelta(minutes=120)
    d2 = (now + timedelta(days=2)).replace(hour=11, minute=0)
    d2_end = d2 + timedelta(minutes=60)

    d_maria = (now + timedelta(days=3)).replace(hour=15, minute=0)
    d_maria_end = d_maria + timedelta(minutes=90)

    bookings_seed = [
        ("b_seed_1", "m_anna", "sal_center", "svc_mani", None, "Елена С.", None, "+79000000001", d1, d1_end),
        ("b_seed_2", "m_anna", "sal_center", "svc_pedi", None, "Олег П.", None, None, d1b, d1b_end),
        ("b_seed_3", "m_olga", "sal_south", "svc_cut", None, "Дарья К.", None, None, d2, d2_end),
        (
            "b_seed_maria",
            "m_anna",
            "sal_center",
            "svc_mani",
            "u_maria",
            "Мария Иванова",
            "maria@example.com",
            "+79001112233",
            d_maria,
            d_maria_end,
        ),
    ]
    for bid, mid, sid, svc, cid, cname, cemail, cphone, start, end in bookings_seed:
        db.add(
            Booking(
                id=bid,
                master_id=mid,
                salon_id=sid,
                service_id=svc,
                client_id=cid,
                client_name=cname,
                client_email=cemail,
                client_phone=cphone,
                start_at=start,
                end_at=end,
                status="scheduled",
            )
        )

    db.commit()
