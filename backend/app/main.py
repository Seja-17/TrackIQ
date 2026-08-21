import uuid
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import init_db, get_session
from app.models import (
    Job, JobCreate, JobUpdate, JobRead, JobStatus,
    Contact, ContactCreate,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs once when the server starts up
    await init_db()
    yield
    # (nothing needed on shutdown yet)


app = FastAPI(title="TrackIQ API", lifespan=lifespan)

# Allows your React frontend (running on a different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "TrackIQ API is running"}


# ---------------- JOBS ----------------

@app.get("/api/jobs", response_model=List[JobRead])
async def list_jobs(
    status: Optional[JobStatus] = Query(default=None),
    search: Optional[str] = Query(default=None),
    session: AsyncSession = Depends(get_session),
):
    query = select(Job).options(selectinload(Job.contacts))

    if status:
        query = query.where(Job.status == status)
    if search:
        like = f"%{search}%"
        query = query.where(
            (Job.company.ilike(like)) | (Job.title.ilike(like))
        )

    query = query.order_by(Job.updated_at.desc())
    result = await session.execute(query)
    return result.scalars().all()


@app.get("/api/jobs/{job_id}", response_model=JobRead)
async def get_job(job_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    query = select(Job).where(Job.id == job_id).options(selectinload(Job.contacts))
    result = await session.execute(query)
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.post("/api/jobs", response_model=JobRead, status_code=201)
async def create_job(job_in: JobCreate, session: AsyncSession = Depends(get_session)):
    job = Job.model_validate(job_in)
    session.add(job)
    await session.commit()
    await session.refresh(job, attribute_names=["contacts"])
    return job


@app.patch("/api/jobs/{job_id}", response_model=JobRead)
async def update_job(
    job_id: uuid.UUID,
    job_in: JobUpdate,
    session: AsyncSession = Depends(get_session),
):
    job = await session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    update_data = job_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(job, key, value)

    session.add(job)
    await session.commit()
    await session.refresh(job, attribute_names=["contacts"])
    return job


@app.delete("/api/jobs/{job_id}", status_code=204)
async def delete_job(job_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    job = await session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    await session.delete(job)
    await session.commit()


# ---------------- CONTACTS ----------------

@app.post("/api/jobs/{job_id}/contacts", response_model=Contact, status_code=201)
async def add_contact(
    job_id: uuid.UUID,
    contact_in: ContactCreate,
    session: AsyncSession = Depends(get_session),
):
    job = await session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    contact = Contact.model_validate(contact_in, update={"job_id": job_id})
    session.add(contact)
    await session.commit()
    await session.refresh(contact)
    return contact


@app.delete("/api/contacts/{contact_id}", status_code=204)
async def delete_contact(contact_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    contact = await session.get(Contact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    await session.delete(contact)
    await session.commit()