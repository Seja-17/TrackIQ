import uuid
from datetime import datetime, date
from enum import Enum
from typing import Optional, List
from zoneinfo import ZoneInfo

from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID


def get_ist_now() -> datetime:
    return datetime.now(ZoneInfo("Asia/Kolkata"))


class JobStatus(str, Enum):
    WISHLIST = "WISHLIST"
    APPLIED = "APPLIED"
    INTERVIEWING = "INTERVIEWING"
    OFFER = "OFFER"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"


class JobBase(SQLModel):
    company: str
    title: str
    job_url: Optional[str] = None
    location: Optional[str] = None
    job_description: Optional[str] = Field(default=None, sa_column=Column(Text))
    status: JobStatus = Field(default=JobStatus.WISHLIST, index=True)
    applied_date: Optional[date] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))


class Job(JobBase, table=True):
    __tablename__ = "jobs"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(PG_UUID(as_uuid=True), primary_key=True),
    )

    # Cached AI-generated content — avoids re-calling Gemini on every view
    generated_email: Optional[str] = Field(default=None, sa_column=Column(Text))
    generated_prep: Optional[str] = Field(default=None, sa_column=Column(Text))

    created_at: datetime = Field(
        default_factory=get_ist_now,
        sa_column=Column(DateTime(timezone=True)),
    )
    updated_at: datetime = Field(
        default_factory=get_ist_now,
        sa_column=Column(DateTime(timezone=True)),
    )

    contacts: List["Contact"] = Relationship(
        back_populates="job",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class ContactBase(SQLModel):
    name: str
    role: Optional[str] = None  # e.g. "Recruiter", "Hiring Manager", "Interviewer"
    email: Optional[str] = None
    linkedin: Optional[str] = None
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))


class Contact(ContactBase, table=True):
    __tablename__ = "contacts"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(PG_UUID(as_uuid=True), primary_key=True),
    )
    job_id: uuid.UUID = Field(foreign_key="jobs.id", index=True)

    created_at: datetime = Field(
        default_factory=get_ist_now,
        sa_column=Column(DateTime(timezone=True)),
    )
    updated_at: datetime = Field(
        default_factory=get_ist_now,
        sa_column=Column(DateTime(timezone=True)),
    )

    job: Job = Relationship(back_populates="contacts")


# ---- API request/response schemas (separate from table models) ----

class JobCreate(JobBase):
    pass


class JobUpdate(SQLModel):
    company: Optional[str] = None
    title: Optional[str] = None
    job_url: Optional[str] = None
    location: Optional[str] = None
    job_description: Optional[str] = None
    status: Optional[JobStatus] = None
    applied_date: Optional[date] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    notes: Optional[str] = None


class ContactCreate(ContactBase):
    pass


class JobRead(JobBase):
    id: uuid.UUID
    generated_email: Optional[str]
    generated_prep: Optional[str]
    created_at: datetime
    updated_at: datetime
    contacts: List[Contact] = []
