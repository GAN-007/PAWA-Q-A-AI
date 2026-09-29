from __future__ import annotations

import asyncio
import logging
import os
import time
from typing import Any

import httpx

logger = logging.getLogger(__name__)


class PawaSystemOne:
    """Fail-open System-One classifier for PAWA questions.

    It only produces routing/evaluation signals. The existing validator and LLM
    remain authoritative for input acceptance and answer generation.
    """

    def __init__(
        self,
        *,
        mode: str | None = None,
        base_url: str | None = None,
        api_key: str | None = None,
        timeout_seconds: float | None = None,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self.mode = (mode or os.getenv("PAWA_SYSTEM_ONE_MODE", "off")).strip().lower()
        self.base_url = (base_url or os.getenv("PAWA_SYSTEM_ONE_BASE_URL", "")).rstrip("/")
        self.api_key = (api_key or os.getenv("PAWA_SYSTEM_ONE_API_KEY", "")).strip()
        self.timeout_seconds = max(
            0.1,
            float(timeout_seconds or os.getenv("PAWA_SYSTEM_ONE_TIMEOUT_SECONDS", "1.5")),
        )
        self.transport = transport
        self._shadow_tasks: set[asyncio.Task[Any]] = set()

    @property
    def enabled(self) -> bool:
        return self.mode in {"shadow", "advisory"} and bool(self.base_url)

    async def classify_for_answer(self, question: str) -> dict[str, Any] | None:
        """Return advisory evidence only when it is allowed to influence answer depth.

        Shadow mode is strictly observational: classification runs in the
        background, the incumbent LLM prompt is unchanged, and the API response
        does not expose a shadow result as if it were part of answer generation.
        """
        if not self.enabled:
            return None
        if self.mode == "shadow":
            task = asyncio.create_task(self.classify(question))
            self._shadow_tasks.add(task)

            def _done(completed: asyncio.Task[Any]) -> None:
                self._shadow_tasks.discard(completed)
                try:
                    completed.result()
                except Exception as exc:
                    logger.debug("PAWA shadow System-One task failed: %s", exc)

            task.add_done_callback(_done)
            return None
        return await self.classify(question)

    async def classify(self, question: str) -> dict[str, Any] | None:
        text = (question or "").strip()
        if not text or not self.enabled:
            return None

        questions = {
            "domain": {
                "type": "choice",
                "instructions": "Which domain best describes this question?",
                "criteria": {
                    "travel_requirements": "Visas, passports, entry rules, documents or border requirements",
                    "travel_planning": "Itinerary, transport, accommodation, destination or trip planning",
                    "travel_safety": "Travel safety, local risk, emergency planning or insurance",
                    "travel_cost": "Budget, prices, currency, fees or travel cost",
                    "general_travel": "General travel information",
                    "non_travel": "The request is not primarily about travel",
                },
            },
            "complexity": {
                "type": "score",
                "instructions": "How much reasoning is required to answer accurately?",
                "criteria": [
                    "simple factual explanation",
                    "several related facts",
                    "multi-step comparison or planning",
                    "specialist or high-consequence reasoning",
                ],
            },
            "needs_fresh_information": {
                "type": "noul",
                "instructions": "Could the correct answer materially depend on current rules, schedules, prices, advisories or recent changes?",
            },
            "needs_external_tools": {
                "type": "noul",
                "instructions": "Would web search, official sources, maps, booking data or another tool materially improve the answer?",
            },
            "ambiguous": {
                "type": "noul",
                "instructions": "Is the request missing important information needed for a reliable answer?",
            },
            "high_consequence": {
                "type": "noul",
                "instructions": "Could an incorrect answer cause meaningful legal, immigration, health, safety or financial consequences?",
            },
        }
        headers = {"content-type": "application/json"}
        if self.api_key:
            headers["authorization"] = f"Bearer {self.api_key}"

        started = time.perf_counter()
        try:
            async with httpx.AsyncClient(
                timeout=self.timeout_seconds,
                follow_redirects=False,
                transport=self.transport,
            ) as client:
                response = await client.post(
                    f"{self.base_url}/v1/systemone",
                    headers=headers,
                    json={
                        "state": {
                            "question": text,
                            "policy": {
                                "advisory_only": True,
                                "validator_and_llm_remain_authoritative": True,
                                "no_travel_fact_is_generated_by_system_one": True,
                            },
                        },
                        "questions": questions,
                    },
                )
                response.raise_for_status()
                body = response.json()
            if not isinstance(body, dict):
                raise TypeError("System-One response must be a JSON object")
            answers = body.get("answers")
            if not isinstance(answers, dict):
                raise ValueError("System-One response is missing answers")
            return {
                "provider": "laya",
                "mode": self.mode,
                "advisory_only": True,
                "answers": answers,
                "routing": body.get("routing") if isinstance(body.get("routing"), dict) else None,
                "usage": body.get("usage") if isinstance(body.get("usage"), dict) else None,
                "latency_ms": int((time.perf_counter() - started) * 1000),
            }
        except (httpx.HTTPError, ValueError, TypeError) as exc:
            logger.warning("PAWA System-One failed open: %s", exc)
            return None


def advisory_prompt(decision: dict[str, Any] | None) -> str:
    if not decision:
        return ""
    answers = decision.get("answers") or {}
    return (
        "\n\nSystem-One advisory routing signals (not factual evidence): "
        + str(answers)
        + "\nUse these only to choose answer depth/caution. Do not treat them as travel facts."
    )
