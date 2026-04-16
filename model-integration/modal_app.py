#!/usr/bin/env python3
"""
Indian Thali Nutrient Scanner — Modal.com deployment (free T4 GPU)
Deploy:  modal deploy modal_app.py
Test:    modal run modal_app.py
"""

import io, json, colorsys
from typing import Dict, List, Tuple

import modal

# ── Container image ───────────────────────────────────────────────────────────
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("git")                          # ← add this line
    .pip_install(
        "torch==2.3.0", "torchvision==0.18.0",
        "transformers>=4.45.0",
        "huggingface_hub>=0.24.0",
        "Pillow>=10.0.0",
        "numpy>=1.26.0",
        "fastapi[standard]",
        "python-multipart",
    )
    .run_commands(
        "pip install git+https://github.com/facebookresearch/sam2.git"
    )
    .add_local_file("weight_model.py", "/root/weight_model.py")
)

app = modal.App("thali-nutrient-scanner", image=image)

# ── Food class registry ───────────────────────────────────────────────────────
IDX2CLASS: Dict[int, str] = {
    0:"background", 1:"Bottle-gourd-curry", 2:"aloo-capsicum",
    3:"aloo-curry", 4:"aloo-fry", 5:"beans-curry",
    6:"beetroot-kobari", 7:"beetroot-poriyal", 8:"bisi-bele-bath",
    9:"boondi", 10:"cabbage-dry", 11:"channa-brinjal",
    12:"chicken-dum-biryani", 13:"chutney", 14:"curd",
    15:"dondakaya-fry", 16:"kakarakaya-fry", 17:"kofta-curry",
    18:"leaf-dal", 19:"mango-pickle", 20:"masoor-dal",
    21:"mirchi-ka-salan", 22:"muddha-pappu", 23:"non-spicy-curry",
    24:"non-spicy-dal", 25:"pachi-pulusu", 26:"papad",
    27:"payasam", 28:"phulka", 29:"raita", 30:"rajma",
    31:"rasam", 32:"salad", 33:"sambar", 34:"steamed-rice",
    35:"tomato-pappu", 36:"veg-dum-briyani", 37:"veg-pulao",
    38:"Watermelon", 39:"Papaya", 40:"Banana", 41:"Muskmelon",
}
CLIP_PROMPTS = [
    f"a photo of Indian {IDX2CLASS[i].replace('-', ' ').lower()}"
    for i in range(1, 42)
]

# ── Nutrient table: {cid0: (kcal, carb, protein, fat, ref_grams)} ─────────────
NUTRIENT_TABLE: Dict[int, Tuple] = {
    0:(92.2,7.3,3.1,5.6,100), 1:(93,13,2,3,100), 2:(102,10.5,1.5,6.5,119),
    3:(133,20,2,6.7,100), 4:(126,19,6.5,3.3,125), 5:(122.5,10,3.8,7.5,100),
    6:(80,14,2,3,100), 7:(126,21.47,4.02,3.51,100), 8:(584,39.55,13.75,41.17,100),
    9:(81,11,2.3,3.9,156), 10:(71,11,2,2.4,100), 11:(155,21,8,4.3,100),
    12:(50,3,3,3.3,100), 13:(69,5.3,3.9,3.7,113), 14:(97,9.51,3.28,6.03,100),
    15:(46,5.74,1.25,2.45,100), 16:(163,19.2,5.6,8.42,100), 17:(116,16.84,6.53,3.03,100),
    18:(135,34.28,0.35,0.18,100), 19:(158,25.45,8.59,2.8,100), 20:(143,9.89,6.06,10.3,100),
    21:(134,20.61,6.47,3.79,100), 22:(92.2,7.3,3.1,5.6,100), 23:(187,29.76,11.42,3.08,100),
    24:(68,4,2,5,100), 25:(371,59.87,25.56,3.25,100), 26:(151,23.74,2.97,5.34,100),
    27:(258,54.26,9.39,1.67,100), 28:(101,6.43,3.31,7.21,100), 29:(165,19.77,7.04,7.08,100),
    30:(19,2.82,0.39,0.88,100), 31:(19,4.63,0.69,0.1,100), 32:(273,38.06,11.63,9.8,240),
    33:(129,28,2.67,0.28,100), 34:(223,29,12,7.7,268), 35:(130,23.33,3.16,2.53,100),
    36:(125,20,2.5,4,100), 37:(30,7.55,0.61,0.15,100), 38:(39,9.81,0.61,0.14,100),
    39:(89,22.84,1.09,0.33,100), 40:(34,8.16,0.84,0.19,100),
}

def _nutrients(weight_g: float, cid0: int) -> Dict[str, float]:
    tup = NUTRIENT_TABLE.get(cid0)
    if not tup:
        return dict(calories=0.0, carbs_g=0.0, protein_g=0.0, fat_g=0.0)
    kcal, carb, prot, fat, ref = tup
    s = weight_g / max(ref, 1e-6)
    return dict(
        calories  = round(kcal * s, 2),
        carbs_g   = round(carb * s, 2),
        protein_g = round(prot * s, 2),
        fat_g     = round(fat  * s, 2),
    )

# ── Modal class (all models live here, GPU always available) ──────────────────
@app.cls(
    gpu="T4",
    scaledown_window=60,   # keep warm 5 min after last request
    timeout=120,
)
class NutrientScanner:

    @modal.enter()
    def load_models(self):
        import sys, torch
        sys.path.insert(0, "/root")

        from transformers import (
            AutoProcessor, AutoModelForZeroShotObjectDetection,
            CLIPModel, CLIPProcessor,
        )
        from sam2.build_sam import build_sam2_hf
        from sam2.sam2_image_predictor import SAM2ImagePredictor
        from huggingface_hub import hf_hub_download
        from torchvision import transforms
        from weight_model import FusionWeightNet_ROI_Conditional_Heavy

        self.device = "cuda"

        print("[boot] Grounding DINO…")
        self.gdino_proc  = AutoProcessor.from_pretrained("IDEA-Research/grounding-dino-base")
        self.gdino_model = AutoModelForZeroShotObjectDetection.from_pretrained(
            "IDEA-Research/grounding-dino-base"
        ).to(self.device).eval()

        print("[boot] SAM2…")
        sam2 = build_sam2_hf("facebook/sam2.1-hiera-small", device=self.device)
        self.sam2_pred = SAM2ImagePredictor(sam2)

        print("[boot] CLIP…")
        self.clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(self.device).eval()
        self.clip_proc  = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        with torch.no_grad():
            txt = self.clip_proc(text=CLIP_PROMPTS, return_tensors="pt", padding=True).to(self.device)
            tf  = self.clip_model.get_text_features(**txt)
            self.text_feats = tf / tf.norm(dim=-1, keepdim=True)   # [41, D]

        print("[boot] WeightNet…")

        HF_REPO = "joharatharv/tpe-project"
        ckpt = hf_hub_download(repo_id=HF_REPO, filename="best_model.pth")

        from weight_model import FusionWeightNet_ROI_Conditional_Heavy
        self.wnet = FusionWeightNet_ROI_Conditional_Heavy(
            backbone_name    = "resnet50",
            pretrained       = False,
            unfreeze_backbone= True,
            attention_mode   = "none",
            modality         = "rgb",
            geom_type        = "none",
            roi_res          = 7,
            resize           = (224, 224),
            num_classes      = 41,
        ).to(self.device).eval()
        self.wnet.load_state_dict(torch.load(ckpt, map_location=self.device))

        self.wnet_tf = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225]),
        ])
        print("[boot] All models ready.")

    # ── Internal helpers ──────────────────────────────────────────────────────
    def _segment(self, img):
        import torch, numpy as np
        inputs = self.gdino_proc(images=img, text="food.", return_tensors="pt").to(self.device)
        with torch.no_grad():
            out = self.gdino_model(**inputs)
        det = self.gdino_proc.post_process_grounded_object_detection(
            out, inputs.input_ids,
            box_threshold=0.25, text_threshold=0.25,
            target_sizes=[img.size[::-1]],
        )[0]
        boxes  = det["boxes"].cpu().numpy()
        scores = det["scores"].cpu().numpy().tolist()
        if len(boxes) == 0:
            return [], []
        self.sam2_pred.set_image(np.array(img))
        masks_raw, _, _ = self.sam2_pred.predict(
            point_coords=None, point_labels=None,
            box=boxes, multimask_output=False,
        )
        if masks_raw.ndim == 4:
            masks_raw = masks_raw.squeeze(1)
        masks = list(masks_raw.astype(bool))
        # drop largest box (likely the plate rim)
        if len(masks) > 1:
            areas = [(b[2]-b[0])*(b[3]-b[1]) for b in boxes]
            drop  = int(__import__("numpy").argmax(areas))
            masks  = [m for i,m in enumerate(masks)  if i != drop]
            scores = [s for i,s in enumerate(scores) if i != drop]
        return masks, scores

    def _classify(self, img, masks):
        import torch, numpy as np
        ids, names, confs = [], [], []
        for mask in masks:
            ys, xs = np.where(mask)
            if len(ys) == 0:
                ids.append(0); names.append("unknown"); confs.append(0.0); continue
            x1,y1,x2,y2 = int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())
            crop = img.crop((x1, y1, x2+1, y2+1))
            inp  = self.clip_proc(images=crop, return_tensors="pt").to(self.device)
            with torch.no_grad():
                f = self.clip_model.get_image_features(**inp)
                f = f / f.norm(dim=-1, keepdim=True)
            sims = (f @ self.text_feats.T).squeeze(0)
            best = int(sims.argmax())
            cid  = best + 1
            ids.append(cid)
            names.append(IDX2CLASS[cid])
            confs.append(round(float(sims[best]), 4))
        return ids, names, confs

    def _estimate_weights(self, img, masks, class_ids):
        import torch, numpy as np
        H, W = 1024, 1024
        img_t = self.wnet_tf(img).unsqueeze(0).to(self.device)
        with torch.no_grad():
            fr = self.wnet.rgb_encoder(img_t)
        Hf, Wf = fr.shape[2], fr.shape[3]

        rois, cls_ids0, kept = [], [], []
        for i, (cid, mask) in enumerate(zip(class_ids, masks)):
            ys, xs = np.where(mask)
            if len(ys) == 0: continue
            x1,x2 = int(xs.min()),int(xs.max())
            y1,y2 = int(ys.min()),int(ys.max())
            if x2<=x1 or y2<=y1: continue
            rois.append([0, x1/W*Wf, y1/H*Hf, x2/W*Wf, y2/H*Hf])
            cls_ids0.append(max(0, cid-1))
            kept.append(i)

        if not rois:
            return [], []

        rois_t   = torch.tensor(rois,     dtype=torch.float32, device=self.device)
        cls_t    = torch.tensor(cls_ids0, dtype=torch.long,    device=self.device)
        fd       = torch.zeros((1,1,Hf,Wf), device=self.device, dtype=fr.dtype)
        stats    = torch.empty((0,0),       device=self.device, dtype=fr.dtype)

        with torch.no_grad():
            preds = self.wnet(fr, fd, rois_t, stats)
            idx_r = torch.arange(preds.size(0), device=self.device)
            wg    = preds[idx_r, cls_t.clamp(0, preds.size(1)-1)].float().cpu().tolist()

        return wg, kept

    # ── Public web endpoint ───────────────────────────────────────────────────
    @modal.fastapi_endpoint(method="POST", docs=True)
    async def analyze(self, request):
        """
        POST /analyze
        Body: multipart/form-data with field "file" (image/jpeg or image/png)
        Returns: JSON nutrient log
        """
        from fastapi import Request
        from PIL import Image

        form  = await request.form()
        field = form.get("file")
        if field is None:
            return {"error": "No 'file' field in form data."}

        raw   = await field.read()
        img   = Image.open(__import__("io").BytesIO(raw)).convert("RGB").resize((1024,1024))

        masks, scores = self._segment(img)
        if not masks:
            return {"error": "No food items detected."}

        class_ids, class_names, confs = self._classify(img, masks)
        weights_g, kept_idx           = self._estimate_weights(img, masks, class_ids)

        items  = []
        totals = dict(weight_g=0.0, calories=0.0, carbs_g=0.0, protein_g=0.0, fat_g=0.0)

        for local_i, w_g in enumerate(weights_g):
            mid  = kept_idx[local_i]
            cid  = class_ids[mid]
            w_g  = max(0.0, float(w_g))
            nut  = _nutrients(w_g, max(0, cid-1))
            item = dict(
                food_item  = IDX2CLASS[cid].replace("-"," "),
                confidence = confs[mid],
                weight_g   = round(w_g, 1),
                **nut,
            )
            items.append(item)
            for k in totals:
                totals[k] = round(totals[k] + item.get(k, 0.0), 2)

        return {"item_count": len(items), "items": items, "totals": totals}


# ── Local test ────────────────────────────────────────────────────────────────
@app.local_entrypoint()
def test():
    import sys
    path = sys.argv[1] if len(sys.argv) > 1 else "test_thali.jpg"
    with open(path, "rb") as f:
        data = f.read()
    scanner = NutrientScanner()
    # call the method directly (not via HTTP) for local testing
    from PIL import Image
    import io
    img = Image.open(io.BytesIO(data)).convert("RGB").resize((1024,1024))
    masks, _   = scanner._segment.local(img)
    print(f"Detected {len(masks)} food items")
