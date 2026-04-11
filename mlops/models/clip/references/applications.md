# CLIP Applications Guide

Practical applications and use cases for CLIP.

## Zero-shot image classification

```python
import torch
import clip
from PIL import Image

model, preprocess = clip.load("ViT-B/32")

# Define categories
categories = [
    "a photo of a dog",
    "a photo of a cat",
    "a photo of a bird",
    "a photo of a car",
    "a photo of a person"
]

# Prepare image
image = preprocess(Image.open("photo.jpg")).unsqueeze(0)
text = clip.tokenize(categories)

# Classify
with torch.no_grad():
    image_features = model.encode_image(image)
    text_features = model.encode_text(text)

    logits_per_image, _ = model(image, text)
    probs = logits_per_image.softmax(dim=-1).cpu().numpy()

# Print results
for category, prob in zip(categories, probs[0]):
    print(f"{category}: {prob:.2%}")
```

## Semantic image search

```python
# Index images
image_database = []
image_paths = ["img1.jpg", "img2.jpg", "img3.jpg"]

for img_path in image_paths:
    image = preprocess(Image.open(img_path)).unsqueeze(0)
    with torch.no_grad():
        features = model.encode_image(image)
        features /= features.norm(dim=-1, keepdim=True)
    image_database.append((img_path, features))

# Search with text
query = "a sunset over mountains"
text_input = clip.tokenize([query])

with torch.no_grad():
    text_features = model.encode_text(text_input)
    text_features /= text_features.norm(dim=-1, keepdim=True)

# Find matches
similarities = []
for img_path, img_features in image_database:
    similarity = (text_features @ img_features.T).item()
    similarities.append((img_path, similarity))

# Sort by similarity
similarities.sort(key=lambda x: x[1], reverse=True)
for img_path, score in similarities[:3]:
    print(f"{img_path}: {score:.3f}")
```

## Content moderation

```python
# Define safety categories
categories = [
    "safe for work content",
    "not safe for work content",
    "violent or graphic content",
    "hate speech or offensive content",
    "spam or misleading content"
]

text = clip.tokenize(categories)

# Check image
with torch.no_grad():
    logits, _ = model(image, text)
    probs = logits.softmax(dim=-1)

# Get classification
max_idx = probs.argmax().item()
confidence = probs[0, max_idx].item()

if confidence > 0.7:
    print(f"Classified as: {categories[max_idx]} ({confidence:.2%})")
else:
    print(f"Uncertain classification (confidence: {confidence:.2%})")
```

## Image-to-text retrieval

```python
# Text database
captions = [
    "A beautiful sunset over the ocean",
    "A cute dog playing in the park",
    "A modern city skyline at night",
    "A delicious pizza with toppings"
]

# Encode captions
caption_features = []
for caption in captions:
    text = clip.tokenize([caption])
    with torch.no_grad():
        features = model.encode_text(text)
        features /= features.norm(dim=-1, keepdim=True)
    caption_features.append(features)

caption_features = torch.cat(caption_features)

# Find matching captions for image
with torch.no_grad():
    image_features = model.encode_image(image)
    image_features /= image_features.norm(dim=-1, keepdim=True)

similarities = (image_features @ caption_features.T).squeeze(0)
top_k = similarities.topk(3)

for idx, score in zip(top_k.indices, top_k.values):
    print(f"{captions[idx]}: {score:.3f}")
```

## Visual question answering

```python
# Create yes/no questions
image = preprocess(Image.open("photo.jpg")).unsqueeze(0)

questions = [
    "a photo showing people",
    "a photo showing animals",
    "a photo taken indoors",
    "a photo taken outdoors",
    "a photo taken during daytime",
    "a photo taken at night"
]

text = clip.tokenize(questions)

with torch.no_grad():
    logits, _ = model(image, text)
    probs = logits.softmax(dim=-1)

# Answer questions
for question, prob in zip(questions, probs[0]):
    answer = "Yes" if prob > 0.5 else "No"
    print(f"{question}: {answer} ({prob:.2%})")
```

## Image deduplication

```python
# Detect duplicate/similar images
def compute_similarity(img1_path, img2_path):
    img1 = preprocess(Image.open(img1_path)).unsqueeze(0)
    img2 = preprocess(Image.open(img2_path)).unsqueeze(0)

    with torch.no_grad():
        feat1 = model.encode_image(img1)
        feat2 = model.encode_image(img2)

        feat1 /= feat1.norm(dim=-1, keepdim=True)
        feat2 /= feat2.norm(dim=-1, keepdim=True)

        similarity = (feat1 @ feat2.T).item()

    return similarity

# Check for duplicates
threshold = 0.95
image_pairs = [("img1.jpg", "img2.jpg"), ("img1.jpg", "img3.jpg")]

for img1, img2 in image_pairs:
    sim = compute_similarity(img1, img2)
    if sim > threshold:
        print(f"{img1} and {img2} are duplicates (similarity: {sim:.3f})")
```

## Best practices

1. **Use descriptive labels** - "a photo of X" works better than just "X"
2. **Normalize embeddings** - Always normalize for cosine similarity
3. **Batch processing** - Process multiple images/texts together
4. **Cache embeddings** - Expensive to recompute
5. **Set appropriate thresholds** - Test on validation data
6. **Use GPU** - 10-50× faster than CPU
7. **Consider model size** - ViT-B/32 good default, ViT-L/14 for best quality

## Resources

- **Paper**: https://arxiv.org/abs/2103.00020
- **GitHub**: https://github.com/openai/CLIP
- **Colab**: https://colab.research.google.com/github/openai/clip/
