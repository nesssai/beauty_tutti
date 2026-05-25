from datetime import datetime

from pydantic import BaseModel, Field


class ServiceOut(BaseModel):
    id: str
    name: str
    durationMinutes: int
    priceRub: int


class SalonOut(BaseModel):
    id: str
    name: str
    address: str
    city: str


class MasterOut(BaseModel):
    id: str
    name: str
    salonId: str
    serviceIds: list[str]


class CatalogOut(BaseModel):
    services: list[ServiceOut]
    salons: list[SalonOut]
    masters: list[MasterOut]


class LoginIn(BaseModel):
    identifier: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=4, max_length=128)


class RegisterIn(BaseModel):
    name: str
    email: str
    phone: str
    password: str


class ClientOut(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    firstVisitDiscountUsed: bool


class MasterSessionOut(BaseModel):
    masterId: str
    name: str


class AuthOut(BaseModel):
    token: str
    role: str
    client: ClientOut | None = None
    master: MasterSessionOut | None = None


class ClientCheckIn(BaseModel):
    email: str
    phone: str


class ClientCheckOut(BaseModel):
    exists: bool
    requiresLogin: bool
    message: str | None = None


class BookingOut(BaseModel):
    id: str
    masterId: str
    salonId: str
    serviceId: str
    startIso: str
    endIso: str
    clientName: str
    clientEmail: str | None = None
    clientPhone: str | None = None
    status: str
    userId: str | None = None
    masterNote: str | None = None


class BookingCreateIn(BaseModel):
    serviceId: str
    salonId: str
    masterId: str
    slotStartIso: str
    clientName: str
    clientEmail: str | None = None
    clientPhone: str | None = None


class BookingStatusIn(BaseModel):
    status: str


class BookingNoteIn(BaseModel):
    note: str


class BlockedOut(BaseModel):
    id: str
    masterId: str
    startIso: str
    endIso: str


class BlockedCreateIn(BaseModel):
    masterId: str
    startIso: str
    endIso: str


class ErrorOut(BaseModel):
    detail: str
