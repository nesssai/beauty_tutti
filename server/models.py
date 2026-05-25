from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from server.db import Base


class Service(Base):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    duration_minutes: Mapped[int] = mapped_column(Integer)
    price_rub: Mapped[int] = mapped_column(Integer)


class Salon(Base):
    __tablename__ = "salons"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    address: Mapped[str] = mapped_column(String(300))
    city: Mapped[str] = mapped_column(String(100))


class Master(Base):
    __tablename__ = "masters"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    salon_id: Mapped[str] = mapped_column(String(32), ForeignKey("salons.id"))
    login: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))

    salon: Mapped["Salon"] = relationship()
    services: Mapped[list["MasterService"]] = relationship(back_populates="master")


class MasterService(Base):
    __tablename__ = "master_services"
    __table_args__ = (UniqueConstraint("master_id", "service_id", name="uq_master_service"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    master_id: Mapped[str] = mapped_column(String(32), ForeignKey("masters.id"))
    service_id: Mapped[str] = mapped_column(String(32), ForeignKey("services.id"))

    master: Mapped["Master"] = relationship(back_populates="services")
    service: Mapped["Service"] = relationship()


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    first_visit_discount_used: Mapped[bool] = mapped_column(Boolean, default=False)


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    master_id: Mapped[str] = mapped_column(String(32), ForeignKey("masters.id"))
    salon_id: Mapped[str] = mapped_column(String(32), ForeignKey("salons.id"))
    service_id: Mapped[str] = mapped_column(String(32), ForeignKey("services.id"))
    client_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("clients.id"), nullable=True)
    client_name: Mapped[str] = mapped_column(String(120))
    client_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    client_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    start_at: Mapped[datetime] = mapped_column(DateTime)
    end_at: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(20), default="scheduled")
    master_note: Mapped[str | None] = mapped_column(Text, nullable=True)


class MasterBlockedInterval(Base):
    __tablename__ = "master_blocked_intervals"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    master_id: Mapped[str] = mapped_column(String(32), ForeignKey("masters.id"))
    start_at: Mapped[datetime] = mapped_column(DateTime)
    end_at: Mapped[datetime] = mapped_column(DateTime)
