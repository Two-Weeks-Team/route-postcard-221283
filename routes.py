from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from models import SessionLocal, Plan
from ai_service import call_inference

router = APIRouter()

class PlanRequest(BaseModel):
    query: str = Field(..., description="User search query describing the trip")
    preferences: Any = Field(..., description="Mood, length, budget, etc.")

class PlanResponse(BaseModel):
    summary: str = Field(..., description="Brief itinerary summary")
    items: List[Dict[str, Any]] = Field(..., description="Day‑by‑day postcard items")
    score: Optional[float] = Field(None, description="Relevance or confidence score")

class InsightsRequest(BaseModel):
    selection: str = Field(..., description="Selected item or day for deeper insight")
    context: Any = Field(..., description="Additional context for the AI")

class InsightsResponse(BaseModel):
    insights: List[str] = Field(..., description="AI‑generated insights")
    next_actions: List[str] = Field(..., description="Suggested next actions")
    highlights: List[str] = Field(..., description="Key highlights")

@router.post("/plan", response_model=PlanResponse)
async def generate_plan(req: PlanRequest):
    messages = [
        {"role": "system", "content": "You are a travel‑planning AI. Return a JSON object with keys: summary (string), items (array of objects), score (float)."},
        {"role": "user", "content": f"Query: {req.query}\nPreferences: {req.preferences}"}
    ]
    ai_result = await call_inference(messages)
    # Persist the request/response for demo purposes
    db = SessionLocal()
    try:
        plan = Plan(query=req.query, preferences=req.preferences, result=ai_result)
        db.add(plan)
        db.commit()
    finally:
        db.close()
    return PlanResponse(
        summary=ai_result.get("summary", "No summary available."),
        items=ai_result.get("items", []),
        score=ai_result.get("score")
    )

@router.post("/insights", response_model=InsightsResponse)
async def get_insights(req: InsightsRequest):
    messages = [
        {"role": "system", "content": "You are an expert travel writer. Provide JSON with keys: insights (array of strings), next_actions (array of strings), highlights (array of strings)."},
        {"role": "user", "content": f"Selection: {req.selection}\nContext: {req.context}"}
    ]
    ai_result = await call_inference(messages)
    return InsightsResponse(
        insights=ai_result.get("insights", []),
        next_actions=ai_result.get("next_actions", []),
        highlights=ai_result.get("highlights", [])
    )
