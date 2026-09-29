from __future__ import annotations

import asyncio
import json

import httpx

from services.system_one import PawaSystemOne, advisory_prompt


def test_disabled_does_not_call_provider():
    async def handler(request: httpx.Request) -> httpx.Response:
        raise AssertionError("provider must not be called")

    client = PawaSystemOne(
        mode="off",
        base_url="http://laya.test:8000",
        transport=httpx.MockTransport(handler),
    )
    assert asyncio.run(client.classify("What visa do I need?")) is None


def test_advisory_typed_decision():
    async def handler(request: httpx.Request) -> httpx.Response:
        payload = json.loads(request.content.decode())
        assert payload["state"]["policy"]["validator_and_llm_remain_authoritative"] is True
        return httpx.Response(
            200,
            json={
                "answers": {
                    "domain": {
                        "type": "choice",
                        "choice": "travel_requirements",
                        "confidence": 0.97,
                        "probabilities": {"travel_requirements": 0.97, "non_travel": 0.03},
                    },
                    "needs_fresh_information": {"type": "noul", "noul": 0.91, "confidence": 0.91},
                },
                "routing": {"model": "english"},
                "usage": {"input_tokens": 40, "output_tokens": 0},
            },
        )

    client = PawaSystemOne(
        mode="advisory",
        base_url="http://laya.test:8000",
        transport=httpx.MockTransport(handler),
    )
    result = asyncio.run(client.classify("What visa documents are required for Kenya to Ireland?"))
    assert result is not None
    assert result["answers"]["domain"]["choice"] == "travel_requirements"
    assert "not factual evidence" in advisory_prompt(result)


def test_provider_failure_fails_open():
    async def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(503, json={"error": "down"})

    client = PawaSystemOne(
        mode="shadow",
        base_url="http://laya.test:8000",
        transport=httpx.MockTransport(handler),
    )
    assert asyncio.run(client.classify("Plan my trip")) is None


def test_non_object_provider_payload_fails_open():
    async def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json=["invalid"])

    client = PawaSystemOne(
        mode="advisory",
        base_url="http://laya.test:8000",
        transport=httpx.MockTransport(handler),
    )
    assert asyncio.run(client.classify("Plan a trip to Nairobi")) is None


def test_shadow_classify_for_answer_does_not_return_advisory_prompt_data():
    async def scenario():
        gate = asyncio.Event()

        async def handler(request: httpx.Request) -> httpx.Response:
            await gate.wait()
            return httpx.Response(
                200,
                json={
                    "answers": {
                        "domain": {
                            "type": "choice",
                            "choice": "travel_planning",
                            "confidence": 0.9,
                        }
                    }
                },
            )

        client = PawaSystemOne(
            mode="shadow",
            base_url="http://laya.test:8000",
            transport=httpx.MockTransport(handler),
        )
        result = await client.classify_for_answer("Plan my trip")
        assert result is None
        gate.set()
        await asyncio.sleep(0)
        await asyncio.sleep(0)

    asyncio.run(scenario())
