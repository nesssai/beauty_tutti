import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload

from server.auth_utils import create_token, decode_token, hash_password, verify_password
from server.db import Base, engine, get_db
from server.models import (
    Booking,
    Client,
    Master,
    MasterBlockedInterval,
    MasterService,
    Salon,
    Service,
)
from server.schemas import (
    AuthOut,
    BlockedCreateIn,
    BlockedOut,
    BookingCreateIn,
    BookingNoteIn,
    BookingOut,
    BookingStatusIn,
    CatalogOut,
    ClientCheckIn,
    ClientCheckOut,
    ClientOut,
    LoginIn,
    MasterOut,
    MasterSessionOut,
    RegisterIn,
    SalonOut,
    ServiceOut,
)
from server.seed import seed_if_empty

SALON_WORK = {
    "start_hour": 9,
    "start_minute": 0,
    "end_hour": 21,
    "end_minute": 0,
    "slot_step_minutes": 30,
}

app = FastAPI(title="BEAUTY TUTTI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def init_db():
    Base.metadata.create_all(bind=engine)
    from server.db import SessionLocal

    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    init_db()


def normalize_email(email: str) -> str:
    return email.strip().lower()


def normalize_phone(phone: str) -> str:
    digits = "".join(c for c in phone if c.isdigit())
    if digits.startswith("8") and len(digits) == 11:
        digits = "7" + digits[1:]
    if digits.startswith("7") and len(digits) == 11:
        return f"+{digits}"
    if len(digits) == 10:
        return f"+7{digits}"
    return phone.strip()


def parse_dt(iso: str) -> datetime:
    dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    if dt.tzinfo is not None:
        return dt.astimezone().replace(tzinfo=None)
    return dt


def now_local() -> datetime:
    return datetime.now().replace(second=0, microsecond=0)


def booking_to_out(b: Booking) -> BookingOut:
    return BookingOut(
        id=b.id,
        masterId=b.master_id,
        salonId=b.salon_id,
        serviceId=b.service_id,
        startIso=b.start_at.isoformat(),
        endIso=b.end_at.isoformat(),
        clientName=b.client_name,
        clientEmail=b.client_email,
        clientPhone=b.client_phone,
        status=b.status,
        userId=b.client_id,
        masterNote=b.master_note,
    )


def blocked_to_out(b: MasterBlockedInterval) -> BlockedOut:
    return BlockedOut(
        id=b.id,
        masterId=b.master_id,
        startIso=b.start_at.isoformat(),
        endIso=b.end_at.isoformat(),
    )


def get_current_auth(
    authorization: Annotated[str | None, Header()] = None,
) -> dict | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization[7:]
    return decode_token(token)


def require_client(auth: dict | None) -> str:
    if not auth or auth.get("role") != "client":
        raise HTTPException(401, "Требуется вход клиента.")
    return auth["sub"]


def require_master(auth: dict | None) -> str:
    if not auth or auth.get("role") != "master":
        raise HTTPException(401, "Требуется вход мастера.")
    return auth["sub"]


def master_has_service(db: Session, master_id: str, service_id: str) -> bool:
    return (
        db.query(MasterService)
        .filter(
            MasterService.master_id == master_id,
            MasterService.service_id == service_id,
        )
        .first()
        is not None
    )


def intervals_overlap(a_start: datetime, a_end: datetime, b_start: datetime, b_end: datetime) -> bool:
    return a_start < b_end and b_start < a_end


def assert_slot_not_past(start: datetime, end: datetime) -> None:
    now = now_local()
    if start < now:
        raise HTTPException(400, "Нельзя записаться на прошедшее время.")


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/catalog", response_model=CatalogOut)
def get_catalog(db: Session = Depends(get_db)):
    services = db.query(Service).all()
    salons = db.query(Salon).all()
    masters = db.query(Master).options(joinedload(Master.services)).all()
    return CatalogOut(
        services=[
            ServiceOut(
                id=s.id,
                name=s.name,
                durationMinutes=s.duration_minutes,
                priceRub=s.price_rub,
            )
            for s in services
        ],
        salons=[
            SalonOut(id=s.id, name=s.name, address=s.address, city=s.city) for s in salons
        ],
        masters=[
            MasterOut(
                id=m.id,
                name=m.name,
                salonId=m.salon_id,
                serviceIds=[ms.service_id for ms in m.services],
            )
            for m in masters
        ],
    )


@app.post("/api/auth/login", response_model=AuthOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    ident = body.identifier.strip()
    password = body.password

    if "@" in ident:
        email = normalize_email(ident)
        client = db.query(Client).filter(Client.email == email).first()
        if client and verify_password(password, client.password_hash):
            token = create_token(client.id, "client")
            return AuthOut(
                token=token,
                role="client",
                client=ClientOut(
                    id=client.id,
                    name=client.name,
                    email=client.email,
                    phone=client.phone,
                    firstVisitDiscountUsed=client.first_visit_discount_used,
                ),
            )
        raise HTTPException(401, "Неверный email или пароль.")

    login_key = ident.lower()
    master = db.query(Master).filter(Master.login == login_key).first()
    if master and verify_password(password, master.password_hash):
        token = create_token(master.id, "master")
        return AuthOut(
            token=token,
            role="master",
            master=MasterSessionOut(masterId=master.id, name=master.name),
        )
    raise HTTPException(401, "Неверный логин или пароль.")


@app.post("/api/auth/register", response_model=AuthOut)
def register(body: RegisterIn, db: Session = Depends(get_db)):
    email = normalize_email(body.email)
    phone = normalize_phone(body.phone)
    if db.query(Client).filter(Client.email == email).first():
        raise HTTPException(400, "Пользователь с таким email уже есть.")
    if db.query(Client).filter(Client.phone == phone).first():
        raise HTTPException(400, "Пользователь с таким телефоном уже есть.")

    client = Client(
        id=f"u_{uuid.uuid4().hex[:12]}",
        name=body.name.strip(),
        email=email,
        phone=phone,
        password_hash=hash_password(body.password),
        first_visit_discount_used=False,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    token = create_token(client.id, "client")
    return AuthOut(
        token=token,
        role="client",
        client=ClientOut(
            id=client.id,
            name=client.name,
            email=client.email,
            phone=client.phone,
            firstVisitDiscountUsed=client.first_visit_discount_used,
        ),
    )


@app.get("/api/auth/me", response_model=AuthOut)
def auth_me(
    db: Session = Depends(get_db),
    auth: dict | None = Depends(get_current_auth),
):
    if not auth:
        raise HTTPException(401, "Не авторизован.")
    role = auth.get("role")
    sub = auth.get("sub")
    if role == "client":
        client = db.query(Client).filter(Client.id == sub).first()
        if not client:
            raise HTTPException(401, "Сессия недействительна.")
        return AuthOut(
            token="",
            role="client",
            client=ClientOut(
                id=client.id,
                name=client.name,
                email=client.email,
                phone=client.phone,
                firstVisitDiscountUsed=client.first_visit_discount_used,
            ),
        )
    if role == "master":
        master = db.query(Master).filter(Master.id == sub).first()
        if not master:
            raise HTTPException(401, "Сессия недействительна.")
        return AuthOut(
            token="",
            role="master",
            master=MasterSessionOut(masterId=master.id, name=master.name),
        )
    raise HTTPException(401, "Не авторизован.")


@app.post("/api/clients/check", response_model=ClientCheckOut)
def check_client(body: ClientCheckIn, db: Session = Depends(get_db)):
    email = normalize_email(body.email)
    phone = normalize_phone(body.phone)
    client = (
        db.query(Client)
        .filter(Client.email == email, Client.phone == phone)
        .first()
    )
    if client:
        return ClientCheckOut(
            exists=True,
            requiresLogin=True,
            message=(
                "Вы уже зарегистрированы в системе. Войдите в аккаунт — "
                "запись без авторизации для этого профиля недоступна."
            ),
        )
    email_only = db.query(Client).filter(Client.email == email).first()
    phone_only = db.query(Client).filter(Client.phone == phone).first()
    if email_only or phone_only:
        return ClientCheckOut(
            exists=True,
            requiresLogin=True,
            message=(
                "Клиент с таким email или телефоном уже есть. "
                "Войдите в аккаунт или укажите другие контакты."
            ),
        )
    return ClientCheckOut(exists=False, requiresLogin=False)


@app.get("/api/bookings", response_model=list[BookingOut])
def list_bookings(
    db: Session = Depends(get_db),
    auth: dict | None = Depends(get_current_auth),
):
    if auth and auth.get("role") == "client":
        rows = db.query(Booking).filter(Booking.client_id == auth["sub"]).all()
        return [booking_to_out(b) for b in rows]
    if auth and auth.get("role") == "master":
        rows = db.query(Booking).filter(Booking.master_id == auth["sub"]).all()
        return [booking_to_out(b) for b in rows]
    rows = db.query(Booking).all()
    return [booking_to_out(b) for b in rows]


@app.get("/api/blocked-intervals", response_model=list[BlockedOut])
def list_blocked(
    masterId: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(MasterBlockedInterval)
    if masterId:
        q = q.filter(MasterBlockedInterval.master_id == masterId)
    return [blocked_to_out(b) for b in q.all()]


@app.get("/api/slots")
def get_slots(
    masterId: str,
    serviceId: str,
    day: str,
    db: Session = Depends(get_db),
):
    service = db.query(Service).filter(Service.id == serviceId).first()
    if not service:
        raise HTTPException(404, "Услуга не найдена.")
    if not master_has_service(db, masterId, serviceId):
        raise HTTPException(400, "Мастер не выполняет эту услугу.")

    try:
        day_date = datetime.strptime(day, "%Y-%m-%d")
    except ValueError as e:
        raise HTTPException(400, "Некорректная дата.") from e

    work_start = day_date.replace(
        hour=SALON_WORK["start_hour"],
        minute=SALON_WORK["start_minute"],
    )
    work_end = day_date.replace(
        hour=SALON_WORK["end_hour"],
        minute=SALON_WORK["end_minute"],
    )

    bookings = (
        db.query(Booking)
        .filter(
            Booking.master_id == masterId,
            Booking.status != "cancelled",
            Booking.start_at >= work_start,
            Booking.start_at < work_end + timedelta(days=1),
        )
        .all()
    )
    blocked = (
        db.query(MasterBlockedInterval)
        .filter(
            MasterBlockedInterval.master_id == masterId,
            MasterBlockedInterval.start_at >= work_start,
            MasterBlockedInterval.start_at < work_end + timedelta(days=1),
        )
        .all()
    )

    busy: list[tuple[datetime, datetime]] = []
    for b in bookings:
        if b.start_at.date() == day_date.date():
            busy.append((b.start_at, b.end_at))
    for bl in blocked:
        if bl.start_at.date() == day_date.date():
            busy.append((bl.start_at, bl.end_at))

    duration = timedelta(minutes=service.duration_minutes)
    step = timedelta(minutes=SALON_WORK["slot_step_minutes"])
    now = now_local()
    slots: list[str] = []
    cursor = work_start
    while cursor + duration <= work_end:
        slot_end = cursor + duration
        clash = any(
            intervals_overlap(cursor, slot_end, bs, be) for bs, be in busy
        )
        if not clash and cursor >= now:
            slots.append(cursor.isoformat())
        cursor += step

    return {"slots": slots}


@app.post("/api/bookings", response_model=BookingOut)
def create_booking(
    body: BookingCreateIn,
    db: Session = Depends(get_db),
    auth: dict | None = Depends(get_current_auth),
):
    service = db.query(Service).filter(Service.id == body.serviceId).first()
    if not service:
        raise HTTPException(404, "Услуга не найдена.")
    if not master_has_service(db, body.masterId, body.serviceId):
        raise HTTPException(400, "Мастер не может выполнить эту услугу.")

    start = parse_dt(body.slotStartIso)
    end = start + timedelta(minutes=service.duration_minutes)
    assert_slot_not_past(start, end)

    client_id: str | None = None
    if auth and auth.get("role") == "client":
        client_id = auth["sub"]
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(401, "Сессия недействительна.")
    else:
        if not body.clientEmail or not body.clientPhone:
            raise HTTPException(400, "Укажите email и телефон.")
        email = normalize_email(body.clientEmail)
        phone = normalize_phone(body.clientPhone)
        existing = (
            db.query(Client)
            .filter(
                (Client.email == email) | (Client.phone == phone),
            )
            .first()
        )
        if existing:
            raise HTTPException(
                403,
                "Клиент уже зарегистрирован. Войдите в аккаунт для записи.",
            )

    active = db.query(Booking).filter(
        Booking.master_id == body.masterId,
        Booking.status != "cancelled",
    )
    for b in active:
        if intervals_overlap(start, end, b.start_at, b.end_at):
            raise HTTPException(409, "Это время уже занято.")

    blocks = db.query(MasterBlockedInterval).filter(
        MasterBlockedInterval.master_id == body.masterId,
    )
    for bl in blocks:
        if intervals_overlap(start, end, bl.start_at, bl.end_at):
            raise HTTPException(409, "Мастер недоступен в это время.")

    booking = Booking(
        id=f"b_{uuid.uuid4().hex[:12]}",
        master_id=body.masterId,
        salon_id=body.salonId,
        service_id=body.serviceId,
        client_id=client_id,
        client_name=body.clientName.strip(),
        client_email=normalize_email(body.clientEmail) if body.clientEmail else None,
        client_phone=normalize_phone(body.clientPhone) if body.clientPhone else None,
        start_at=start,
        end_at=end,
        status="scheduled",
    )
    db.add(booking)
    if client_id:
        client = db.query(Client).filter(Client.id == client_id).first()
        if client and not client.first_visit_discount_used:
            client.first_visit_discount_used = True
    db.commit()
    db.refresh(booking)
    return booking_to_out(booking)


@app.patch("/api/bookings/{booking_id}/status", response_model=BookingOut)
def update_status(
    booking_id: str,
    body: BookingStatusIn,
    db: Session = Depends(get_db),
    auth: dict | None = Depends(get_current_auth),
):
    if body.status not in ("scheduled", "cancelled"):
        raise HTTPException(400, "Недопустимый статус.")
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Запись не найдена.")
    if booking.status == "completed":
        raise HTTPException(400, "Завершённую запись нельзя изменить.")

    if auth and auth.get("role") == "master":
        if booking.master_id != auth["sub"]:
            raise HTTPException(403, "Нет доступа.")
    elif auth and auth.get("role") == "client":
        if booking.client_id != auth["sub"]:
            raise HTTPException(403, "Нет доступа.")
        if body.status != "cancelled":
            raise HTTPException(403, "Клиент может только отменить запись.")
        now = now_local()
        if booking.start_at <= now:
            raise HTTPException(400, "Нельзя отменить прошедшую запись.")
        if booking.start_at - now < timedelta(hours=24):
            raise HTTPException(400, "Отмена возможна не позднее чем за 24 часа.")
    else:
        raise HTTPException(401, "Требуется авторизация.")

    booking.status = body.status
    db.commit()
    db.refresh(booking)
    return booking_to_out(booking)


@app.patch("/api/bookings/{booking_id}/note", response_model=BookingOut)
def update_note(
    booking_id: str,
    body: BookingNoteIn,
    db: Session = Depends(get_db),
    auth: dict | None = Depends(get_current_auth),
):
    master_id = require_master(auth)
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking or booking.master_id != master_id:
        raise HTTPException(404, "Запись не найдена.")
    booking.master_note = body.note
    db.commit()
    db.refresh(booking)
    return booking_to_out(booking)


@app.post("/api/blocked-intervals", response_model=BlockedOut)
def create_blocked(
    body: BlockedCreateIn,
    db: Session = Depends(get_db),
    auth: dict | None = Depends(get_current_auth),
):
    master_id = require_master(auth)
    if body.masterId != master_id:
        raise HTTPException(403, "Нет доступа.")
    start = parse_dt(body.startIso)
    end = parse_dt(body.endIso)
    if end <= start:
        raise HTTPException(400, "Время окончания должно быть позже начала.")
    assert_slot_not_past(start, end)

    active = db.query(Booking).filter(
        Booking.master_id == master_id,
        Booking.status != "cancelled",
    )
    for b in active:
        if intervals_overlap(start, end, b.start_at, b.end_at):
            raise HTTPException(409, "На это время уже есть запись.")

    row = MasterBlockedInterval(
        id=f"blk_{uuid.uuid4().hex[:12]}",
        master_id=master_id,
        start_at=start,
        end_at=end,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return blocked_to_out(row)


@app.delete("/api/blocked-intervals/{interval_id}")
def delete_blocked(
    interval_id: str,
    db: Session = Depends(get_db),
    auth: dict | None = Depends(get_current_auth),
):
    master_id = require_master(auth)
    row = (
        db.query(MasterBlockedInterval)
        .filter(
            MasterBlockedInterval.id == interval_id,
            MasterBlockedInterval.master_id == master_id,
        )
        .first()
    )
    if not row:
        raise HTTPException(404, "Интервал не найден.")
    db.delete(row)
    db.commit()
    return {"ok": True}


def run():
    import uvicorn

    uvicorn.run("server.main:app", host="127.0.0.1", port=8000, reload=True)


if __name__ == "__main__":
    run()
