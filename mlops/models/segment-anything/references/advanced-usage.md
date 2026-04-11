# Segment Anything Advanced Usage Guide

## SAM 2 (Video Segmentation)

### Overview

SAM 2 extends SAM to video segmentation with streaming memory architecture:

```bash
pip install git+https://github.com/facebookresearch/segment-anything-2.git
```

### Video segmentation

```python
from sam2.build_sam import build_sam2_video_predictor

predictor = build_sam2_video_predictor("sam2_hiera_l.yaml", "sam2_hiera_large.pt")

# Initialize with video
predictor.init_state(video_path="video.mp4")

# Add prompt on first frame
predictor.add_new_points(
    frame_idx=0,
    obj_id=1,
    points=[[100, 200]],
    labels=[1]
)

# Propagate through video
for frame_idx, masks in predictor.propagate_in_video():
    # masks contains segmentation for all tracked objects
    process_frame(frame_idx, masks)
```

### SAM 2 vs SAM comparison

| Feature | SAM | SAM 2 |
|---------|-----|-------|
| Input | Images only | Images + Videos |
| Architecture | ViT + Decoder | Hiera + Memory |
| Memory | Per-image | Streaming memory bank |
| Tracking | No | Yes, across frames |
| Models | ViT-B/L/H | Hiera-T/S/B+/L |

## Grounded SAM (Text-Prompted Segmentation)

### Setup

```bash
pip install groundingdino-py
pip install git+https://github.com/facebookresearch/segment-anything.git
```

### Text-to-mask pipeline

```python
from groundingdino.util.inference import load_model, predict
from segment_anything import sam_model_registry, SamPredictor
import cv2

# Load Grounding DINO
grounding_model = load_model("groundingdino_swint_ogc.pth", "GroundingDINO_SwinT_OGC.py")

# Load SAM
sam = sam_model_registry["vit_h"](checkpoint="sam_vit_h_4b8939.pth")
predictor = SamPredictor(sam)

def text_to_mask(image, text_prompt, box_threshold=0.3, text_threshold=0.25):
    """Generate masks from text description."""
    # Get bounding boxes from text
    boxes, logits, phrases = predict(
        model=grounding_model,
        image=image,
        caption=text_prompt,
        box_threshold=box_threshold,
        text_threshold=text_threshold
    )

    # Generate masks with SAM
    predictor.set_image(image)

    masks = []
    for box in boxes:
        # Convert normalized box to pixel coordinates
        h, w = image.shape[:2]
        box_pixels = box * np.array([w, h, w, h])

        mask, score, _ = predictor.predict(
            box=box_pixels,
            multimask_output=False
        )
        masks.append(mask[0])

    return masks, boxes, phrases

# Usage
image = cv2.imread("image.jpg")
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

masks, boxes, phrases = text_to_mask(image, "person . dog . car")
```

## Batched Processing

### Efficient multi-image processing

```python
import torch
from segment_anything import SamPredictor, sam_model_registry

class BatchedSAM:
    def __init__(self, checkpoint, model_type="vit_h", device="cuda"):
        self.sam = sam_model_registry[model_type](checkpoint=checkpoint)
        self.sam.to(device)
        self.predictor = SamPredictor(self.sam)
        self.device = device

    def process_batch(self, images, prompts):
        """Process multiple images with corresponding prompts."""
        results = []

        for image, prompt in zip(images, prompts):
            self.predictor.set_image(image)

            if "point" in prompt:
                masks, scores, _ = self.predictor.predict(
                    point_coords=prompt["point"],
                    point_labels=prompt["label"],
                    multimask_output=True
                )
            elif "box" in prompt:
                masks, scores, _ = self.predictor.predict(
                    box=prompt["box"],
                    multimask_output=False
                )

            results.append({
                "masks": masks,
                "scores": scores,
                "best_mask": masks[np.argmax(scores)]
            })

        return results

# Usage
batch_sam = BatchedSAM("sam_vit_h_4b8939.pth")

images = [cv2.imread(f"image_{i}.jpg") for i in range(10)]
prompts = [{"point": np.array([[100, 100]]), "label": np.array([1])} for _ in range(10)]

results = batch_sam.process_batch(images, prompts)
```

### Parallel automatic mask generation

```python
from concurrent.futures import ThreadPoolExecutor
from segment_anything import SamAutomaticMaskGenerator

def generate_masks_parallel(images, num_workers=4):
    """Generate masks for multiple images in parallel."""
    # Note: Each worker needs its own model instance
    def worker_init():
        sam = sam_model_registry["vit_b"](checkpoint="sam_vit_b_01ec64.pth")
        return SamAutomaticMaskGenerator(sam)

    generators = [worker_init() for _ in range(num_workers)]

    def process_image(args):
        idx, image = args
        generator = generators[idx % num_workers]
        return generator.generate(image)

    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        results = list(executor.map(process_image, enumerate(images)))

    return results
```

## Custom Integration

### FastAPI service

```python
from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
import numpy as np
import cv2
import io

app = FastAPI()

# Load model once
sam = sam_model_registry["vit_h"](checkpoint="sam_vit_h_4b8939.pth")
sam.to("cuda")
predictor = SamPredictor(sam)

class PointPrompt(BaseModel):
    x: int
    y: int
    label: int = 1

@app.post("/segment/point")
async def segment_with_point(
    file: UploadFile = File(...),
    points: list[PointPrompt] = []
):
    # Read image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Set image
    predictor.set_image(image)

    # Prepare prompts
    point_coords = np.array([[p.x, p.y] for p in points])
    point_labels = np.array([p.label for p in points])

    # Generate masks
    masks, scores, _ = predictor.predict(
        point_coords=point_coords,
        point_labels=point_labels,
        multimask_output=True
    )

    best_idx = np.argmax(scores)

    return {
        "mask": masks[best_idx].tolist(),
        "score": float(scores[best_idx]),
        "all_scores": scores.tolist()
    }

@app.post("/segment/auto")
async def segment_automatic(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    mask_generator = SamAutomaticMaskGenerator(sam)
    masks = mask_generator.generate(image)

    return {
        "num_masks": len(masks),
        "masks": [
            {
                "bbox": m["bbox"],
                "area": m["area"],
                "predicted_iou": m["predicted_iou"],
                "stability_score": m["stability_score"]
            }
            for m in masks
        ]
    }
```

### Gradio interface

```python
import gradio as gr
import numpy as np

# Load model
sam = sam_model_registry["vit_h"](checkpoint="sam_vit_h_4b8939.pth")
predictor = SamPredictor(sam)

def segment_image(image, evt: gr.SelectData):
    """Segment object at clicked point."""
    predictor.set_image(image)

    point = np.array([[evt.index[0], evt.index[1]]])
    label = np.array([1])

    masks, scores, _ = predictor.predict(
        point_coords=point,
        point_labels=label,
        multimask_output=True
    )

    best_mask = masks[np.argmax(scores)]

    # Overlay mask on image
    overlay = image.copy()
    overlay[best_mask] = overlay[best_mask] * 0.5 + np.array([255, 0, 0]) * 0.5

    return overlay

with gr.Blocks() as demo:
    gr.Markdown("# SAM Interactive Segmentation")
    gr.Markdown("Click on an object to segment it")

    with gr.Row():
        input_image = gr.Image(label="Input Image", interactive=True)
        output_image = gr.Image(label="Segmented Image")

    input_image.select(segment_image, inputs=[input_image], outputs=[output_image])

demo.launch()
```

## Fine-Tuning SAM

### LoRA fine-tuning (experimental)

```python
from peft import LoraConfig, get_peft_model
from transformers import SamModel

# Load model
model = SamModel.from_pretrained("facebook/sam-vit-base")

# Configure LoRA
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["qkv"],  # Attention layers
    lora_dropout=0.1,
    bias="none",
)

# Apply LoRA
model = get_peft_model(model, lora_config)

# Training loop (simplified)
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)

for batch in dataloader:
    outputs = model(
        pixel_values=batch["pixel_values"],
        input_points=batch["input_points"],
        input_labels=batch["input_labels"]
    )

    # Custom loss (e.g., IoU loss with ground truth)
    loss = compute_loss(outputs.pred_masks, batch["gt_masks"])
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()
```

### MedSAM (Medical imaging)

```python
# MedSAM is a fine-tuned SAM for medical images
# https://github.com/bowang-lab/MedSAM

from segment_anything import sam_model_registry, SamPredictor
import torch

# Load MedSAM checkpoint
medsam = sam_model_registry["vit_b"](checkpoint="medsam_vit_b.pth")
medsam.to("cuda")

predictor = SamPredictor(medsam)

# Process medical image
# Convert grayscale to RGB if needed
medical_image = cv2.imread("ct_scan.png", cv2.IMREAD_GRAYSCALE)
rgb_image = np.stack([medical_image] * 3, axis=-1)

predictor.set_image(rgb_image)

# Segment with box prompt (common for medical imaging)
masks, scores, _ = predictor.predict(
    box=np.array([x1, y1, x2, y2]),
    multimask_output=False
)
```

## Advanced Mask Processing

### Mask refinement

```python
import cv2
from scipy import ndimage

def refine_mask(mask, kernel_size=5, iterations=2):
    """Refine mask with morphological operations."""
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))

    # Close small holes
    closed = cv2.morphologyEx(mask.astype(np.uint8), cv2.MORPH_CLOSE, kernel, iterations=iterations)

    # Remove small noise
    opened = cv2.morphologyEx(closed, cv2.MORPH_OPEN, kernel, iterations=iterations)

    return opened.astype(bool)

def fill_holes(mask):
    """Fill holes in mask."""
    filled = ndimage.binary_fill_holes(mask)
    return filled

def remove_small_regions(mask, min_area=100):
    """Remove small disconnected regions."""
    labeled, num_features = ndimage.label(mask)
    sizes = ndimage.sum(mask, labeled, range(1, num_features + 1))

    # Keep only regions larger than min_area
    mask_clean = np.zeros_like(mask)
    for i, size in enumerate(sizes, 1):
        if size >= min_area:
            mask_clean[labeled == i] = True

    return mask_clean
```

### Mask to polygon conversion

```python
import cv2

def mask_to_polygons(mask, epsilon_factor=0.01):
    """Convert binary mask to polygon coordinates."""
    contours, _ = cv2.findContours(
        mask.astype(np.uint8),
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    polygons = []
    for contour in contours:
        epsilon = epsilon_factor * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        polygon = approx.squeeze().tolist()
        if len(polygon) >= 3:  # Valid polygon
            polygons.append(polygon)

    return polygons

def polygons_to_mask(polygons, height, width):
    """Convert polygons back to binary mask."""
    mask = np.zeros((height, width), dtype=np.uint8)
    for polygon in polygons:
        pts = np.array(polygon, dtype=np.int32)
        cv2.fillPoly(mask, [pts], 1)
    return mask.astype(bool)
```

### Multi-scale segmentation

```python
def multiscale_segment(image, predictor, point, scales=[0.5, 1.0, 2.0]):
    """Generate masks at multiple scales and combine."""
    h, w = image.shape[:2]
    masks_all = []

    for scale in scales:
        # Resize image
        new_h, new_w = int(h * scale), int(w * scale)
        scaled_image = cv2.resize(image, (new_w, new_h))
        scaled_point = (point * scale).astype(int)

        # Segment
        predictor.set_image(scaled_image)
        masks, scores, _ = predictor.predict(
            point_coords=scaled_point.reshape(1, 2),
            point_labels=np.array([1]),
            multimask_output=True
        )

        # Resize mask back
        best_mask = masks[np.argmax(scores)]
        original_mask = cv2.resize(best_mask.astype(np.uint8), (w, h)) > 0.5

        masks_all.append(original_mask)

    # Combine masks (majority voting)
    combined = np.stack(masks_all, axis=0)
    final_mask = np.sum(combined, axis=0) >= len(scales) // 2 + 1

    return final_mask
```

## Performance Optimization

### TensorRT acceleration

```python
import tensorrt as trt
import pycuda.driver as cuda
import pycuda.autoinit

def export_to_tensorrt(onnx_path, engine_path, fp16=True):
    """Convert ONNX model to TensorRT engine."""
    logger = trt.Logger(trt.Logger.WARNING)
    builder = trt.Builder(logger)
    network = builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))
    parser = trt.OnnxParser(network, logger)

    with open(onnx_path, 'rb') as f:
        if not parser.parse(f.read()):
            for error in range(parser.num_errors):
                print(parser.get_error(error))
            return None

    config = builder.create_builder_config()
    config.max_workspace_size = 1 << 30  # 1GB

    if fp16:
        config.set_flag(trt.BuilderFlag.FP16)

    engine = builder.build_engine(network, config)

    with open(engine_path, 'wb') as f:
        f.write(engine.serialize())

    return engine
```

### Memory-efficient inference

```python
class MemoryEfficientSAM:
    def __init__(self, checkpoint, model_type="vit_b"):
        self.sam = sam_model_registry[model_type](checkpoint=checkpoint)
        self.sam.eval()
        self.predictor = None

    def __enter__(self):
        self.sam.to("cuda")
        self.predictor = SamPredictor(self.sam)
        return self

    def __exit__(self, *args):
        self.sam.to("cpu")
        torch.cuda.empty_cache()

    def segment(self, image, points, labels):
        self.predictor.set_image(image)
        masks, scores, _ = self.predictor.predict(
            point_coords=points,
            point_labels=labels,
            multimask_output=True
        )
        return masks, scores

# Usage with context manager (auto-cleanup)
with MemoryEfficientSAM("sam_vit_b_01ec64.pth") as sam:
    masks, scores = sam.segment(image, points, labels)
# CUDA memory freed automatically
```

## Dataset Generation

### Create segmentation dataset

```python
import json

def generate_dataset(images_dir, output_dir, mask_generator):
    """Generate segmentation dataset from images."""
    annotations = []

    for img_path in Path(images_dir).glob("*.jpg"):
        image = cv2.imread(str(img_path))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Generate masks
        masks = mask_generator.generate(image)

        # Filter high-quality masks
        good_masks = [m for m in masks if m["predicted_iou"] > 0.9]

        # Save annotations
        for i, mask_data in enumerate(good_masks):
            annotation = {
                "image_id": img_path.stem,
                "mask_id": i,
                "bbox": mask_data["bbox"],
                "area": mask_data["area"],
                "segmentation": mask_to_rle(mask_data["segmentation"]),
                "predicted_iou": mask_data["predicted_iou"],
                "stability_score": mask_data["stability_score"]
            }
            annotations.append(annotation)

    # Save dataset
    with open(output_dir / "annotations.json", "w") as f:
        json.dump(annotations, f)

    return annotations
```
