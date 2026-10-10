"""GET /api/relocation/{country} plus data integrity rules (CONTRACT.md sections 5 and 9)."""
import re

from routers.relocation import load_relocation

COUNTRIES = ("DE", "ES", "FR", "IT")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
ROUTE_KEYS = {
    "id", "name", "purpose", "required_language_level", "summary",
    "eligibility", "fees", "official_url", "last_verified", "verified",
}


def test_all_four_countries_respond(client):
    for code in COUNTRIES:
        resp = client.get(f"/api/relocation/{code}")
        assert resp.status_code == 200, (code, resp.text)
        body = resp.json()
        assert set(body) == {"country", "routes", "checklist", "cities", "sources"}
        assert body["country"] == code
        assert body["routes"] and body["checklist"] and body["cities"] and body["sources"]
        for route in body["routes"]:
            assert set(route) == ROUTE_KEYS
            assert route["purpose"] in {"work", "study", "settle", "family"}
            assert route["eligibility"]
            assert route["summary"]
            for fee in route["fees"]:
                assert set(fee) == {"label", "amount", "currency", "source_url"}
        for item in body["checklist"]:
            assert set(item) == {"id", "label", "needs_translation", "needs_apostille"}
        for city in body["cities"]:
            assert set(city) == {"name", "rent_range_eur", "note"}
        for source in body["sources"]:
            assert set(source) == {"label", "url", "last_verified"}
            assert source["url"].startswith("https://")


def test_lowercase_country_accepted(client):
    resp = client.get("/api/relocation/de")
    assert resp.status_code == 200
    assert resp.json()["country"] == "DE"


def test_unknown_country_is_404(client):
    resp = client.get("/api/relocation/ZZ")
    assert resp.status_code == 404
    assert resp.json() == {
        "error": {"code": "not_found", "message": "Unknown country ZZ"}
    }


def test_no_invented_numbers_in_data():
    """Section 9: any fee/rent/language-level number must carry its source and date."""
    for code in COUNTRIES:
        info = load_relocation(code)
        assert len(info.routes) >= 2
        for route in info.routes:
            if route.required_language_level is not None:
                assert route.last_verified and DATE_RE.match(route.last_verified), (
                    f"{code}/{route.id}: language level without verification"
                )
            if route.verified:
                assert route.last_verified and DATE_RE.match(route.last_verified), (
                    f"{code}/{route.id}: verified without last_verified"
                )
            else:
                assert route.last_verified is None, (
                    f"{code}/{route.id}: last_verified set but verified is false"
                )
            for fee in route.fees:
                if fee.amount is not None:
                    assert fee.source_url, f"{code}/{route.id}: fee {fee.label} has no source_url"
                    assert fee.last_verified and DATE_RE.match(fee.last_verified), (
                        f"{code}/{route.id}: fee {fee.label} has no last_verified"
                    )
        for city in info.cities:
            if city.rent_range_eur is not None:
                assert "https://" in city.note, (
                    f"{code}/{city.name}: rent set without a source URL in the note"
                )
        for source in info.sources:
            if source.last_verified is not None:
                assert DATE_RE.match(source.last_verified)
