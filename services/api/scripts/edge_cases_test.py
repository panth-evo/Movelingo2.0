import httpx
import asyncio

BASE_URL = "http://localhost:8000/api"

async def test_edge_cases():
    async with httpx.AsyncClient() as client:
        print("Starting Edge Case Bombardment...")
        
        # 1. POST /users - Create user
        r = await client.post(f"{BASE_URL}/users")
        user_id = r.json().get("user_id") if r.status_code == 200 else "unknown_user"
        print(f"[POST /users] {r.status_code}")
        
        headers = {"X-User-Id": user_id}

        # 2. PUT profile with completely missing fields
        r = await client.put(f"{BASE_URL}/users/{user_id}/profile", headers=headers, json={})
        print(f"[PUT /profile - Empty JSON] {r.status_code}")

        # 3. POST plan generation with missing language
        r = await client.post(f"{BASE_URL}/plan/generate", headers=headers, json={})
        print(f"[POST /plan/generate - Missing Language] {r.status_code}")
        
        # 4. POST plan generation with invalid language
        r = await client.post(f"{BASE_URL}/plan/generate", headers=headers, json={"language": "invalid_lang"})
        print(f"[POST /plan/generate - Invalid Language] {r.status_code}")

        # 5. GET relocation with unknown country
        r = await client.get(f"{BASE_URL}/relocation/XX", headers=headers)
        print(f"[GET /relocation/XX - Unknown Country] {r.status_code}")

        # 6. POST placement result with bad data
        r = await client.post(f"{BASE_URL}/placement/result", headers=headers, json={"language": "zz", "placed_level": "Z9"})
        print(f"[POST /placement/result - Bad Data] {r.status_code}")

        # 7. POST exams/generate with missing spec_id
        r = await client.post(f"{BASE_URL}/exams/generate", headers=headers, json={"language": "de"})
        print(f"[POST /exams/generate - Missing Spec ID] {r.status_code}")

        # 8. POST exams/generate with invalid spec_id
        r = await client.post(f"{BASE_URL}/exams/generate", headers=headers, json={"language": "de", "spec_id": "non_existent_spec"})
        print(f"[POST /exams/generate - Invalid Spec ID] {r.status_code}")

        # 9. GET non-existent exam paper
        r = await client.get(f"{BASE_URL}/exams/papers/fake_paper_id", headers=headers)
        print(f"[GET /exams/papers/fake - Invalid Paper ID] {r.status_code}")
        
        # 10. POST exams submit without required skill
        r = await client.post(f"{BASE_URL}/exams/papers/fake_paper_id/submit", headers=headers, json={"answers": {}})
        print(f"[POST /exams/papers/submit - Missing Skill] {r.status_code}")
        
        print("Edge Case Bombardment Finished.")

if __name__ == "__main__":
    asyncio.run(test_edge_cases())
