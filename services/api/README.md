# MoveLingo Core API (Person B)

This is the core backend API for MoveLingo, handling user profiles, relocation planning, document management, and deterministic progress tracking.

## Setup & Run

1. **Install dependencies:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

2. **Run the server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

3. **Run tests:**
   ```bash
   pytest tests/api/
   ```

4. **Seed Demo User:**
   ```bash
   python scripts/seed_demo.py
   ```
   *Copy the output `USER_ID` for use in the endpoints below.*

## Endpoints (cURL Examples)

Replace `YOUR_USER_ID` with the ID obtained from `POST /api/users`.

### 1. Create User
```bash
curl -X POST http://localhost:8000/api/users
```

### 2. Save Profile
```bash
curl -X PUT http://localhost:8000/api/users/YOUR_USER_ID/profile \
  -H "X-User-Id: YOUR_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "nationality": "US",
    "current_country": "US",
    "passport_valid_until": "2029-01-01",
    "marital_status": "single",
    "dependants": 0,
    "education": {"highest": "Bachelors", "field": "CS", "university": "MIT", "graduation_year": 2020, "grade": "A"},
    "work": {"profession": "Developer", "years_experience": 3.0, "salary_range": "60k-80k", "job_offer": true, "sponsor": false},
    "goal": {"purpose": "work", "target_country": "DE", "target_city": "Berlin", "move_deadline": "2025-01-01"},
    "finance": {"savings_eur": 5000.0, "monthly_budget_eur": 2000.0, "open_to_loans": false},
    "languages_known": [{"language": "de", "self_level": "A1"}],
    "study": {"hours_per_day": 2.0, "style": "visual", "device": "laptop", "weakest_skill": "speaking"}
  }'
```

### 3. Generate Plan
```bash
curl -X POST http://localhost:8000/api/plan/generate \
  -H "X-User-Id: YOUR_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"language": "de"}'
```

### 4. Read Progress
```bash
curl -X GET http://localhost:8000/api/progress?language=de \
  -H "X-User-Id: YOUR_USER_ID"
```

### 5. Fetch Relocation Data
```bash
curl -X GET http://localhost:8000/api/relocation/de \
  -H "X-User-Id: YOUR_USER_ID"
```

### 6. List Documents
```bash
curl -X GET http://localhost:8000/api/documents \
  -H "X-User-Id: YOUR_USER_ID"
```
