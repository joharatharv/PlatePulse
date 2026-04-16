# 🍛 Indian Thali Nutrient Scanner — Modal Deployment

Free GPU inference via Modal.com (~$30 free credits/month, T4 GPU, no subscription needed).

---

## Setup (one time)

```bash
# 1. Install Modal CLI locally
pip install modal

# 2. Authenticate (opens browser)
modal setup

# 3. Edit modal_app.py line ~85 — set your HuggingFace model repo:
#    HF_REPO = "joharatharv/tpe-project"   ← your actual repo

# 4. Deploy
modal deploy modal_app.py
```

Modal prints your live endpoint URL:
```
✓ Created web endpoint: https://YOUR-USERNAME--thali-nutrient-scanner-nutrientscanner-analyze.modal.run
```

---

## API Usage

### From your website (JavaScript)
```javascript
async function analyzeThali(imageFile) {
  const form = new FormData();
  form.append("file", imageFile);           // File object from <input> or camera

  const res = await fetch(
    "https://YOUR-USERNAME--thali-nutrient-scanner-nutrientscanner-analyze.modal.run",
    { method: "POST", body: form }
  );
  const data = await res.json();
  return data;
}

// Response shape:
// {
//   item_count: 5,
//   items: [
//     { food_item: "steamed rice", confidence: 0.82, weight_g: 187.3,
//       calories: 417.7, carbs_g: 54.2, protein_g: 22.5, fat_g: 14.4 },
//     ...
//   ],
//   totals: { weight_g: 620.0, calories: 891.2, carbs_g: 110.5, protein_g: 38.2, fat_g: 28.7 }
// }
```

### From Python
```python
import requests

with open("thali.jpg", "rb") as f:
    res = requests.post(
        "https://YOUR-URL.modal.run",
        files={"file": ("thali.jpg", f, "image/jpeg")},
    )
print(res.json())
```

---

## Cost Estimate

| Metric | Value |
|---|---|
| GPU | T4 (free tier) |
| Per request | ~10–20 seconds GPU time |
| Cost per request | ~$0.004–0.008 |
| Free credits/month | $30 |
| Free requests/month | ~3,750–7,500 |

Container stays warm for 5 minutes after last request (configurable), so repeat requests are instant.

---

## Files

| File | Purpose |
|---|---|
| `modal_app.py` | Full pipeline + Modal web endpoint |
| `weight_model.py` | WeightNet architecture (do not edit) |
| `requirements.txt` | Local Modal CLI only |
