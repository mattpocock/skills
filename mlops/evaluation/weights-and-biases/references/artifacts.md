# Artifacts & Model Registry Guide

Complete guide to data versioning and model management with W&B Artifacts.

## Table of Contents
- What are Artifacts
- Creating Artifacts
- Using Artifacts
- Model Registry
- Versioning & Lineage
- Best Practices

## What are Artifacts

Artifacts are versioned datasets, models, or files tracked with lineage.

**Key Features:**
- Automatic versioning (v0, v1, v2...)
- Lineage tracking (which runs produced/used artifacts)
- Efficient storage (deduplication)
- Collaboration (team-wide access)
- Aliases (latest, best, production)

**Common Use Cases:**
- Dataset versioning
- Model checkpoints
- Preprocessed data
- Evaluation results
- Configuration files

## Creating Artifacts

### Basic Dataset Artifact

```python
import wandb

run = wandb.init(project="my-project")

# Create artifact
dataset = wandb.Artifact(
    name='training-data',
    type='dataset',
    description='ImageNet training split with augmentations',
    metadata={
        'size': '1.2M images',
        'format': 'JPEG',
        'resolution': '224x224'
    }
)

# Add files
dataset.add_file('data/train.csv')        # Single file
dataset.add_dir('data/images')            # Entire directory
dataset.add_reference('s3://bucket/data') # Cloud reference

# Log artifact
run.log_artifact(dataset)
wandb.finish()
```

### Model Artifact

```python
import torch
import wandb

run = wandb.init(project="my-project")

# Train model
model = train_model()

# Save model
torch.save(model.state_dict(), 'model.pth')

# Create model artifact
model_artifact = wandb.Artifact(
    name='resnet50-classifier',
    type='model',
    description='ResNet50 trained on ImageNet',
    metadata={
        'architecture': 'ResNet50',
        'accuracy': 0.95,
        'loss': 0.15,
        'epochs': 50,
        'framework': 'PyTorch'
    }
)

# Add model file
model_artifact.add_file('model.pth')

# Add config
model_artifact.add_file('config.yaml')

# Log with aliases
run.log_artifact(model_artifact, aliases=['latest', 'best'])

wandb.finish()
```

### Preprocessed Data Artifact

```python
import pandas as pd
import wandb

run = wandb.init(project="nlp-project")

# Preprocess data
df = pd.read_csv('raw_data.csv')
df_processed = preprocess(df)
df_processed.to_csv('processed_data.csv', index=False)

# Create artifact
processed_data = wandb.Artifact(
    name='processed-text-data',
    type='dataset',
    metadata={
        'rows': len(df_processed),
        'columns': list(df_processed.columns),
        'preprocessing_steps': ['lowercase', 'remove_stopwords', 'tokenize']
    }
)

processed_data.add_file('processed_data.csv')

# Log artifact
run.log_artifact(processed_data)
```

## Using Artifacts

### Download and Use

```python
import wandb

run = wandb.init(project="my-project")

# Download artifact
artifact = run.use_artifact('training-data:latest')
artifact_dir = artifact.download()

# Use files
import pandas as pd
df = pd.read_csv(f'{artifact_dir}/train.csv')

# Train with artifact data
model = train_model(df)
```

### Use Specific Version

```python
# Use specific version
artifact_v2 = run.use_artifact('training-data:v2')

# Use alias
artifact_best = run.use_artifact('model:best')
artifact_prod = run.use_artifact('model:production')

# Use from another project
artifact = run.use_artifact('team/other-project/model:latest')
```

### Check Artifact Metadata

```python
artifact = run.use_artifact('training-data:latest')

# Access metadata
print(artifact.metadata)
print(f"Size: {artifact.metadata['size']}")

# Access version info
print(f"Version: {artifact.version}")
print(f"Created at: {artifact.created_at}")
print(f"Digest: {artifact.digest}")
```

## Model Registry

Link models to a central registry for governance and deployment.

### Create Model Registry

```python
# In W&B UI:
# 1. Go to "Registry" tab
# 2. Create new registry: "production-models"
# 3. Define stages: development, staging, production
```

### Link Model to Registry

```python
import wandb

run = wandb.init(project="training")

# Create model artifact
model_artifact = wandb.Artifact(
    name='sentiment-classifier',
    type='model',
    metadata={'accuracy': 0.94, 'f1': 0.92}
)

model_artifact.add_file('model.pth')

# Log artifact
run.log_artifact(model_artifact)

# Link to registry
run.link_artifact(
    model_artifact,
    'model-registry/production-models',
    aliases=['staging']  # Deploy to staging
)

wandb.finish()
```

### Promote Model in Registry

```python
# Retrieve model from registry
api = wandb.Api()
artifact = api.artifact('model-registry/production-models/sentiment-classifier:staging')

# Promote to production
artifact.link('model-registry/production-models', aliases=['production'])

# Demote from production
artifact.aliases = ['archived']
artifact.save()
```

### Use Model from Registry

```python
import wandb

run = wandb.init()

# Download production model
model_artifact = run.use_artifact(
    'model-registry/production-models/sentiment-classifier:production'
)

model_dir = model_artifact.download()

# Load and use
import torch
model = torch.load(f'{model_dir}/model.pth')
model.eval()
```

## Versioning & Lineage

### Automatic Versioning

```python
# First log: creates v0
run1 = wandb.init(project="my-project")
dataset_v0 = wandb.Artifact('my-dataset', type='dataset')
dataset_v0.add_file('data_v1.csv')
run1.log_artifact(dataset_v0)

# Second log with same name: creates v1
run2 = wandb.init(project="my-project")
dataset_v1 = wandb.Artifact('my-dataset', type='dataset')
dataset_v1.add_file('data_v2.csv')  # Different content
run2.log_artifact(dataset_v1)

# Third log with SAME content as v1: references v1 (no new version)
run3 = wandb.init(project="my-project")
dataset_v1_again = wandb.Artifact('my-dataset', type='dataset')
dataset_v1_again.add_file('data_v2.csv')  # Same content as v1
run3.log_artifact(dataset_v1_again)  # Still v1, no v2 created
```

### Track Lineage

```python
# Training run
run = wandb.init(project="my-project")

# Use dataset (input)
dataset = run.use_artifact('training-data:v3')
data = load_data(dataset.download())

# Train model
model = train(data)

# Save model (output)
model_artifact = wandb.Artifact('trained-model', type='model')
torch.save(model.state_dict(), 'model.pth')
model_artifact.add_file('model.pth')
run.log_artifact(model_artifact)

# Lineage automatically tracked:
# training-data:v3 --> [run] --> trained-model:v0
```

### View Lineage Graph

```python
# In W&B UI:
# Artifacts → Select artifact → Lineage tab
# Shows:
# - Which runs produced this artifact
# - Which runs used this artifact
# - Parent/child artifacts
```

## Artifact Types

### Dataset Artifacts

```python
# Raw data
raw_data = wandb.Artifact('raw-data', type='dataset')
raw_data.add_dir('raw/')

# Processed data
processed_data = wandb.Artifact('processed-data', type='dataset')
processed_data.add_dir('processed/')

# Train/val/test splits
train_split = wandb.Artifact('train-split', type='dataset')
train_split.add_file('train.csv')

val_split = wandb.Artifact('val-split', type='dataset')
val_split.add_file('val.csv')
```

### Model Artifacts

```python
# Checkpoint during training
checkpoint = wandb.Artifact('checkpoint-epoch-10', type='model')
checkpoint.add_file('checkpoint_epoch_10.pth')

# Final model
final_model = wandb.Artifact('final-model', type='model')
final_model.add_file('model.pth')
final_model.add_file('tokenizer.json')

# Quantized model
quantized = wandb.Artifact('quantized-model', type='model')
quantized.add_file('model_int8.onnx')
```

### Result Artifacts

```python
# Predictions
predictions = wandb.Artifact('test-predictions', type='predictions')
predictions.add_file('predictions.csv')

# Evaluation metrics
eval_results = wandb.Artifact('evaluation', type='evaluation')
eval_results.add_file('metrics.json')
eval_results.add_file('confusion_matrix.png')
```

## Advanced Patterns

### Incremental Artifacts

Add files incrementally without re-uploading.

```python
run = wandb.init(project="my-project")

# Create artifact
dataset = wandb.Artifact('incremental-dataset', type='dataset')

# Add files incrementally
for i in range(100):
    filename = f'batch_{i}.csv'
    process_batch(i, filename)
    dataset.add_file(filename)

    # Log progress
    if (i + 1) % 10 == 0:
        print(f"Added {i + 1}/100 batches")

# Log complete artifact
run.log_artifact(dataset)
```

### Artifact Tables

Track structured data with W&B Tables.

```python
import wandb

run = wandb.init(project="my-project")

# Create table
table = wandb.Table(columns=["id", "image", "label", "prediction"])

for idx, (img, label, pred) in enumerate(zip(images, labels, predictions)):
    table.add_data(
        idx,
        wandb.Image(img),
        label,
        pred
    )

# Log as artifact
artifact = wandb.Artifact('predictions-table', type='predictions')
artifact.add(table, "predictions")
run.log_artifact(artifact)
```

### Artifact References

Reference external data without copying.

```python
# S3 reference
dataset = wandb.Artifact('s3-dataset', type='dataset')
dataset.add_reference('s3://my-bucket/data/', name='train')
dataset.add_reference('s3://my-bucket/labels/', name='labels')

# GCS reference
dataset.add_reference('gs://my-bucket/data/')

# HTTP reference
dataset.add_reference('https://example.com/data.zip')

# Local filesystem reference (for shared storage)
dataset.add_reference('file:///mnt/shared/data')
```

## Collaboration Patterns

### Team Dataset Sharing

```python
# Data engineer creates dataset
run = wandb.init(project="data-eng", entity="my-team")
dataset = wandb.Artifact('shared-dataset', type='dataset')
dataset.add_dir('data/')
run.log_artifact(dataset, aliases=['latest', 'production'])

# ML engineer uses dataset
run = wandb.init(project="ml-training", entity="my-team")
dataset = run.use_artifact('my-team/data-eng/shared-dataset:production')
data = load_data(dataset.download())
```

### Model Handoff

```python
# Training team
train_run = wandb.init(project="model-training", entity="ml-team")
model = train_model()
model_artifact = wandb.Artifact('nlp-model', type='model')
model_artifact.add_file('model.pth')
train_run.log_artifact(model_artifact)
train_run.link_artifact(model_artifact, 'model-registry/nlp-models', aliases=['candidate'])

# Evaluation team
eval_run = wandb.init(project="model-eval", entity="ml-team")
model_artifact = eval_run.use_artifact('model-registry/nlp-models/nlp-model:candidate')
metrics = evaluate_model(model_artifact)

if metrics['f1'] > 0.9:
    # Promote to production
    model_artifact.link('model-registry/nlp-models', aliases=['production'])
```

## Best Practices

### 1. Use Descriptive Names

```python
# ✅ Good: Descriptive names
wandb.Artifact('imagenet-train-augmented-v2', type='dataset')
wandb.Artifact('bert-base-sentiment-finetuned', type='model')

# ❌ Bad: Generic names
wandb.Artifact('dataset1', type='dataset')
wandb.Artifact('model', type='model')
```

### 2. Add Comprehensive Metadata

```python
model_artifact = wandb.Artifact(
    'production-model',
    type='model',
    description='ResNet50 classifier for product categorization',
    metadata={
        # Model info
        'architecture': 'ResNet50',
        'framework': 'PyTorch 2.0',
        'pretrained': True,

        # Performance
        'accuracy': 0.95,
        'f1_score': 0.93,
        'inference_time_ms': 15,

        # Training
        'epochs': 50,
        'dataset': 'imagenet',
        'num_samples': 1200000,

        # Business context
        'use_case': 'e-commerce product classification',
        'owner': 'ml-team@company.com',
        'approved_by': 'data-science-lead'
    }
)
```

### 3. Use Aliases for Deployment Stages

```python
# Development
run.log_artifact(model, aliases=['dev', 'latest'])

# Staging
run.log_artifact(model, aliases=['staging'])

# Production
run.log_artifact(model, aliases=['production', 'v1.2.0'])

# Archive old versions
old_artifact = api.artifact('model:production')
old_artifact.aliases = ['archived-v1.1.0']
old_artifact.save()
```

### 4. Track Data Lineage

```python
def create_training_pipeline():
    run = wandb.init(project="pipeline")

    # 1. Load raw data
    raw_data = run.use_artifact('raw-data:latest')

    # 2. Preprocess
    processed = preprocess(raw_data)
    processed_artifact = wandb.Artifact('processed-data', type='dataset')
    processed_artifact.add_file('processed.csv')
    run.log_artifact(processed_artifact)

    # 3. Train model
    model = train(processed)
    model_artifact = wandb.Artifact('trained-model', type='model')
    model_artifact.add_file('model.pth')
    run.log_artifact(model_artifact)

    # Lineage: raw-data → processed-data → trained-model
```

### 5. Efficient Storage

```python
# ✅ Good: Reference large files
large_dataset = wandb.Artifact('large-dataset', type='dataset')
large_dataset.add_reference('s3://bucket/huge-file.tar.gz')

# ❌ Bad: Upload giant files
# large_dataset.add_file('huge-file.tar.gz')  # Don't do this

# ✅ Good: Upload only metadata
metadata_artifact = wandb.Artifact('dataset-metadata', type='dataset')
metadata_artifact.add_file('metadata.json')  # Small file
```

## Resources

- **Artifacts Documentation**: https://docs.wandb.ai/guides/artifacts
- **Model Registry**: https://docs.wandb.ai/guides/model-registry
- **Best Practices**: https://wandb.ai/site/articles/versioning-data-and-models-in-ml
