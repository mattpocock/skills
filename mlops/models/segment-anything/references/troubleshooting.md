# Segment Anything Troubleshooting Guide

## Installation Issues

### CUDA not available

**Error**: `RuntimeError: CUDA not available`

**Solutions**:
```python
# Check CUDA availability
import torch
print(torch.cuda.is_available())
print(torch.version.cuda)

# Install PyTorch with CUDA
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121

# If CUDA works but SAM doesn't use it
sam = sam_model_registry["vit_h"](checkpoint="sam_vit_h_4b8939.pth")
sam.to("cuda")  # Explicitly move to GPU
```

### Import errors

**Error**: `ModuleNotFoundError: No module named 'segment_anything'`

**Solutions**:
```bash
# Install from GitHub
pip install git+https://github.com/facebookresearch/segment-anything.git

# Or clone and install
git clone https://github.com/facebookresearch/segment-anything.git
cd segment-anything
pip install -e .

# Verify installation
python -c "from segment_anything import sam_model_registry; print('OK')"
```

### Missing dependencies

**Error**: `ModuleNotFoundError: No module named 'cv2'` or similar

**Solutions**:
```bash
# Install all optional dependencies
pip install opencv-python pycocotools matplotlib onnxruntime onnx

# For pycocotools on Windows
pip install pycocotools-windows
```

## Model Loading Issues

### Checkpoint not found

**Error**: `FileNotFoundError: checkpoint file not found`

**Solutions**:
```bash
# Download correct checkpoint
wget https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth

# Verify file integrity
md5sum sam_vit_h_4b8939.pth
# Expected: a7bf3b02f3ebf1267aba913ff637d9a2

# Use absolute path
sam = sam_model_registry["vit_h"](checkpoint="/full/path/to/sam_vit_h_4b8939.pth")
```

### Model type mismatch

**Error**: `KeyError: 'unexpected key in state_dict'`

**Solutions**:
```python
# Ensure model type matches checkpoint
# vit_h checkpoint → vit_h model
sam = sam_model_registry["vit_h"](checkpoint="sam_vit_h_4b8939.pth")

# vit_l checkpoint → vit_l model
sam = sam_model_registry["vit_l"](checkpoint="sam_vit_l_0b3195.pth")

# vit_b checkpoint → vit_b model
sam = sam_model_registry["vit_b"](checkpoint="sam_vit_b_01ec64.pth")
```

### Out of memory during load

**Error**: `CUDA out of memory` during model loading

**Solutions**:
```python
# Use smaller model
sam = sam_model_registry["vit_b"](checkpoint="sam_vit_b_01ec64.pth")

# Load to CPU first, then move
sam = sam_model_registry["vit_h"](checkpoint="sam_vit_h_4b8939.pth")
sam.to("cpu")
torch.cuda.empty_cache()
sam.to("cuda")

# Use half precision
sam = sam_model_registry["vit_h"](checkpoint="sam_vit_h_4b8939.pth")
sam = sam.half()
sam.to("cuda")
```

## Inference Issues

### Image format errors

**Error**: `ValueError: expected input to have 3 channels`

**Solutions**:
```python
import cv2

# Ensure RGB format
image = cv2.imread("image.jpg")
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # BGR to RGB

# Convert grayscale to RGB
if len(image.shape) == 2:
    image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)

# Handle RGBA
if image.shape[2] == 4:
    image = image[:, :, :3]  # Drop alpha channel
```

### Coordinate errors

**Error**: `IndexError: index out of bounds` or incorrect mask location

**Solutions**:
```python
# Ensure points are (x, y) not (row, col)
# x = column index, y = row index
point = np.array([[x, y]])  # Correct

# Verify coordinates are within image bounds
h, w = image.shape[:2]
assert 0 <= x < w and 0 <= y < h, "Point outside image"

# For bounding boxes: [x1, y1, x2, y2]
box = np.array([x1, y1, x2, y2])
assert x1 < x2 and y1 < y2, "Invalid box coordinates"
```

### Empty or incorrect masks

**Problem**: Masks don't match expected object

**Solutions**:
```python
# Try multiple prompts
input_points = np.array([[x1, y1], [x2, y2]])
input_labels = np.array([1, 1])  # Multiple foreground points

# Add background points
input_points = np.array([[obj_x, obj_y], [bg_x, bg_y]])
input_labels = np.array([1, 0])  # 1=foreground, 0=background

# Use box prompt for large objects
box = np.array([x1, y1, x2, y2])
masks, scores, _ = predictor.predict(box=box, multimask_output=False)

# Combine box and point
masks, scores, _ = predictor.predict(
    point_coords=np.array([[center_x, center_y]]),
    point_labels=np.array([1]),
    box=np.array([x1, y1, x2, y2]),
    multimask_output=True
)

# Check scores and select best
print(f"Scores: {scores}")
best_mask = masks[np.argmax(scores)]
```

### Slow inference

**Problem**: Prediction takes too long

**Solutions**:
```python
# Use smaller model
sam = sam_model_registry["vit_b"](checkpoint="sam_vit_b_01ec64.pth")

# Reuse image embeddings
predictor.set_image(image)  # Compute once
for point in points:
    masks, _, _ = predictor.predict(...)  # Fast, reuses embeddings

# Reduce automatic generation points
mask_generator = SamAutomaticMaskGenerator(
    model=sam,
    points_per_side=16,  # Default is 32
)

# Use ONNX for deployment
# Export: python scripts/export_onnx_model.py --return-single-mask
```

## Automatic Mask Generation Issues

### Too many masks

**Problem**: Generating thousands of overlapping masks

**Solutions**:
```python
mask_generator = SamAutomaticMaskGenerator(
    model=sam,
    points_per_side=16,          # Reduce from 32
    pred_iou_thresh=0.92,        # Increase from 0.88
    stability_score_thresh=0.98,  # Increase from 0.95
    box_nms_thresh=0.5,          # More aggressive NMS
    min_mask_region_area=500,    # Remove small masks
)
```

### Too few masks

**Problem**: Missing objects in automatic generation

**Solutions**:
```python
mask_generator = SamAutomaticMaskGenerator(
    model=sam,
    points_per_side=64,          # Increase density
    pred_iou_thresh=0.80,        # Lower threshold
    stability_score_thresh=0.85,  # Lower threshold
    crop_n_layers=2,             # Add multi-scale
    min_mask_region_area=0,      # Keep all masks
)
```

### Small objects missed

**Problem**: Automatic generation misses small objects

**Solutions**:
```python
# Use crop layers for multi-scale detection
mask_generator = SamAutomaticMaskGenerator(
    model=sam,
    crop_n_layers=2,
    crop_n_points_downscale_factor=1,  # Don't reduce points in crops
    min_mask_region_area=10,  # Very small minimum
)

# Or process image patches
def segment_with_patches(image, patch_size=512, overlap=64):
    h, w = image.shape[:2]
    all_masks = []

    for y in range(0, h, patch_size - overlap):
        for x in range(0, w, patch_size - overlap):
            patch = image[y:y+patch_size, x:x+patch_size]
            masks = mask_generator.generate(patch)

            # Offset masks to original coordinates
            for m in masks:
                m['bbox'][0] += x
                m['bbox'][1] += y
                # Offset segmentation mask too

            all_masks.extend(masks)

    return all_masks
```

## Memory Issues

### CUDA out of memory

**Error**: `torch.cuda.OutOfMemoryError: CUDA out of memory`

**Solutions**:
```python
# Use smaller model
sam = sam_model_registry["vit_b"](checkpoint="sam_vit_b_01ec64.pth")

# Clear cache between images
torch.cuda.empty_cache()

# Process images sequentially, not batched
for image in images:
    predictor.set_image(image)
    masks, _, _ = predictor.predict(...)
    torch.cuda.empty_cache()

# Reduce image size
max_size = 1024
h, w = image.shape[:2]
if max(h, w) > max_size:
    scale = max_size / max(h, w)
    image = cv2.resize(image, (int(w*scale), int(h*scale)))

# Use CPU for large batch processing
sam.to("cpu")
```

### RAM out of memory

**Problem**: System runs out of RAM

**Solutions**:
```python
# Process images one at a time
for img_path in image_paths:
    image = cv2.imread(img_path)
    masks = process_image(image)
    save_results(masks)
    del image, masks
    gc.collect()

# Use generators instead of lists
def generate_masks_lazy(image_paths):
    for path in image_paths:
        image = cv2.imread(path)
        masks = mask_generator.generate(image)
        yield path, masks
```

## ONNX Export Issues

### Export fails

**Error**: Various export errors

**Solutions**:
```bash
# Install correct ONNX version
pip install onnx==1.14.0 onnxruntime==1.15.0

# Use correct opset version
python scripts/export_onnx_model.py \
    --checkpoint sam_vit_h_4b8939.pth \
    --model-type vit_h \
    --output sam.onnx \
    --opset 17
```

### ONNX runtime errors

**Error**: `ONNXRuntimeError` during inference

**Solutions**:
```python
import onnxruntime

# Check available providers
print(onnxruntime.get_available_providers())

# Use CPU provider if GPU fails
session = onnxruntime.InferenceSession(
    "sam.onnx",
    providers=['CPUExecutionProvider']
)

# Verify input shapes
for input in session.get_inputs():
    print(f"{input.name}: {input.shape}")
```

## HuggingFace Integration Issues

### Processor errors

**Error**: Issues with SamProcessor

**Solutions**:
```python
from transformers import SamModel, SamProcessor

# Use matching processor and model
model = SamModel.from_pretrained("facebook/sam-vit-huge")
processor = SamProcessor.from_pretrained("facebook/sam-vit-huge")

# Ensure input format
input_points = [[[x, y]]]  # Nested list for batch dimension
inputs = processor(image, input_points=input_points, return_tensors="pt")

# Post-process correctly
masks = processor.image_processor.post_process_masks(
    outputs.pred_masks.cpu(),
    inputs["original_sizes"].cpu(),
    inputs["reshaped_input_sizes"].cpu()
)
```

## Quality Issues

### Jagged mask edges

**Problem**: Masks have rough, pixelated edges

**Solutions**:
```python
import cv2
from scipy import ndimage

def smooth_mask(mask, sigma=2):
    """Smooth mask edges."""
    # Gaussian blur
    smooth = ndimage.gaussian_filter(mask.astype(float), sigma=sigma)
    return smooth > 0.5

def refine_edges(mask, kernel_size=5):
    """Refine mask edges with morphological operations."""
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
    # Close small gaps
    closed = cv2.morphologyEx(mask.astype(np.uint8), cv2.MORPH_CLOSE, kernel)
    # Open to remove noise
    opened = cv2.morphologyEx(closed, cv2.MORPH_OPEN, kernel)
    return opened.astype(bool)
```

### Incomplete segmentation

**Problem**: Mask doesn't cover entire object

**Solutions**:
```python
# Add multiple points
input_points = np.array([
    [obj_center_x, obj_center_y],
    [obj_left_x, obj_center_y],
    [obj_right_x, obj_center_y],
    [obj_center_x, obj_top_y],
    [obj_center_x, obj_bottom_y]
])
input_labels = np.array([1, 1, 1, 1, 1])

# Use bounding box
masks, _, _ = predictor.predict(
    box=np.array([x1, y1, x2, y2]),
    multimask_output=False
)

# Iterative refinement
mask_input = None
for point in points:
    masks, scores, logits = predictor.predict(
        point_coords=point.reshape(1, 2),
        point_labels=np.array([1]),
        mask_input=mask_input,
        multimask_output=False
    )
    mask_input = logits
```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `CUDA out of memory` | GPU memory full | Use smaller model, clear cache |
| `expected 3 channels` | Wrong image format | Convert to RGB |
| `index out of bounds` | Invalid coordinates | Check point/box bounds |
| `checkpoint not found` | Wrong path | Use absolute path |
| `unexpected key` | Model/checkpoint mismatch | Match model type |
| `invalid box coordinates` | x1 > x2 or y1 > y2 | Fix box format |

## Getting Help

1. **GitHub Issues**: https://github.com/facebookresearch/segment-anything/issues
2. **HuggingFace Forums**: https://discuss.huggingface.co
3. **Paper**: https://arxiv.org/abs/2304.02643

### Reporting Issues

Include:
- Python version
- PyTorch version: `python -c "import torch; print(torch.__version__)"`
- CUDA version: `python -c "import torch; print(torch.version.cuda)"`
- SAM model type (vit_b/l/h)
- Full error traceback
- Minimal reproducible code
